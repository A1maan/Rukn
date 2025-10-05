"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Users } from "lucide-react";
import FloatingTitle from "@/components/dashboard/FloatingTitle";
import FloatingFilters from "@/components/dashboard/FloatingFilters";
import FloatingVolumeCard from "@/components/dashboard/FloatingVolumeCard";
import FloatingSentimentCard from "@/components/dashboard/FloatingSentimentCard";
import FlaggedRequestsCard from "@/components/dashboard/FlaggedRequestsCard";
import FlaggedRequestsButton from "@/components/dashboard/FlaggedRequestsButton";
import LiveOpsCard from "@/components/dashboard/LiveOpsCard";
import AlertsTicker from "@/components/dashboard/AlertsTicker";
import FloatingInstructionCard from "@/components/dashboard/FloatingInstructionCard";
import AlertModal from "@/components/dashboard/AlertModal";
import AlertsListModal from "@/components/dashboard/AlertsListModal";
import { Alert, Aggregate, FlaggedRequest } from "@/types";

// Dynamic import for map to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/dashboard/MapView"), { ssr: false });

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [flaggedRequests, setFlaggedRequests] = useState<FlaggedRequest[]>([]);
  const [aggregate, setAggregate] = useState<Aggregate | null>(null);
  const [regionEWIs, setRegionEWIs] = useState<Record<string, number>>({});
  const [timeWindow, setTimeWindow] = useState("today");
  const [channels, setChannels] = useState<string[]>(["call", "chat", "survey"]);
  const [showFlaggedRequests, setShowFlaggedRequests] = useState(false);
  const [showAlertsList, setShowAlertsList] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Fetch all regions' EWI data for initial map coloring
  useEffect(() => {
    fetch(`/api/aggregates?window=${timeWindow}`)
      .then((res) => res.json())
      .then((data: Aggregate[]) => {
        // Convert array of aggregates to record mapping region code -> EWI
        const ewisMap: Record<string, number> = {};
        data.forEach((agg) => {
          if (agg.region) {
            ewisMap[agg.region] = agg.ewi;
          }
        });
        setRegionEWIs(ewisMap);
      })
      .catch(console.error);
  }, [timeWindow]);

  // Fetch alerts
  useEffect(() => {
    fetch(`/api/alerts?status=pending&window=${timeWindow}`)
      .then((res) => res.json())
      .then((data: Alert[]) => setAlerts(data))
      .catch(console.error);
  }, [timeWindow]);

  // Fetch flagged requests
  useEffect(() => {
    const params = new URLSearchParams({
      status: "pending",
      ...(selectedRegion && { region: selectedRegion })
    });
    
    fetch(`/api/flagged-requests?${params}`)
      .then((res) => res.json())
      .then((data: FlaggedRequest[]) => setFlaggedRequests(data))
      .catch(console.error);
  }, [selectedRegion]);

  // Fetch aggregate data when region is selected OR on initial load with timeWindow
  useEffect(() => {
    if (!selectedRegion) {
      setAggregate(null);
      return;
    }

    fetch(`/api/aggregates?region=${encodeURIComponent(selectedRegion)}&window=${timeWindow}`)
      .then((res) => res.json())
      .then((data: Aggregate) => setAggregate(data))
      .catch(console.error);
  }, [selectedRegion, timeWindow]);

  // Filter flagged requests by urgency for high priority count
  const highPriorityCount = flaggedRequests.filter((req) => req.urgency === "HIGH").length;

  const handleRegionClick = (regionName: string) => {
    setSelectedRegion(regionName);
    setHasInteracted(true);
  };

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  const handleCloseModal = () => {
    setSelectedAlert(null);
  };

  const handleApprove = (alertId: string, note?: string) => {
    console.log("Approved alert:", alertId, note);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleReject = (alertId: string, note?: string) => {
    console.log("Rejected alert:", alertId, note);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleReviewRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/flagged-requests?id=${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reviewed" }),
      });

      if (response.ok) {
        // Remove from list immediately for better UX
        setFlaggedRequests((prev) => prev.filter((req) => req.id !== requestId));
      }
    } catch (error) {
      console.error("Failed to review request:", error);
    }
  };

  const handleEscalateRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/flagged-requests?id=${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "escalated" }),
      });

      if (response.ok) {
        setFlaggedRequests((prev) => prev.filter((req) => req.id !== requestId));
      }
    } catch (error) {
      console.error("Failed to escalate request:", error);
    }
  };

  const handleDismissRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/flagged-requests?id=${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed" }),
      });

      if (response.ok) {
        setFlaggedRequests((prev) => prev.filter((req) => req.id !== requestId));
      }
    } catch (error) {
      console.error("Failed to dismiss request:", error);
    }
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Floating UI elements */}
      <FloatingTitle />
      <FloatingFilters
        onWindowChange={setTimeWindow}
        onChannelChange={setChannels}
      />

      {/* User Support Button */}
      <Link
        href="/user"
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm border-2 border-amber-300 text-gray-700 hover:bg-amber-50 hover:border-amber-400 transition-all shadow-md"
        title="User Support"
      >
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">Support</span>
      </Link>

      <div className="absolute inset-0">
        {/* Map fills the entire space */}
        <MapView
          onRegionClick={handleRegionClick}
          selectedRegion={selectedRegion}
          regionEWIs={regionEWIs}
        />

        {/* Floating cards overlay the map */}
        {!selectedRegion && !aggregate && !hasInteracted && (
          <FloatingInstructionCard onClose={() => setHasInteracted(true)} />
        )}

        {aggregate && (
          <>
            <FloatingVolumeCard aggregate={aggregate} />
            <FloatingSentimentCard aggregate={aggregate} />
          </>
        )}

        {/* Bottom utility cards */}
        <LiveOpsCard aggregate={aggregate} />
        <AlertsTicker alerts={alerts} onClickMore={() => setShowAlertsList(true)} onSelect={handleAlertClick} />

        {/* Flagged requests button - always show if there are requests */}
        {flaggedRequests.length > 0 && !showFlaggedRequests && (
          <FlaggedRequestsButton
            count={flaggedRequests.length}
            highPriorityCount={highPriorityCount}
            onClick={() => setShowFlaggedRequests(true)}
          />
        )}

        {/* Flagged requests modal - shows when button is clicked */}
        {showFlaggedRequests && (
          <FlaggedRequestsCard
            requests={flaggedRequests}
            onReview={handleReviewRequest}
            onEscalate={handleEscalateRequest}
            onDismiss={handleDismissRequest}
            onClose={() => setShowFlaggedRequests(false)}
          />
        )}

        {/* Alerts List Modal - shows all alerts */}
        {showAlertsList && (
          <AlertsListModal
            alerts={alerts}
            onClose={() => setShowAlertsList(false)}
            onAlertClick={handleAlertClick}
          />
        )}

        {/* Alert Detail Modal - for recommended actions */}
        {selectedAlert && (
          <AlertModal
            alert={selectedAlert}
            onClose={handleCloseModal}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>
    </div>
  );
}