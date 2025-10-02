"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Users } from "lucide-react";
import FloatingTitle from "@/components/FloatingTitle";
import FloatingFilters from "@/components/FloatingFilters";
import FloatingVolumeCard from "@/components/FloatingVolumeCard";
import FloatingSentimentCard from "@/components/FloatingSentimentCard";
import FlaggedRequestsCard from "@/components/FlaggedRequestsCard";
import FlaggedRequestsButton from "@/components/FlaggedRequestsButton";
import LiveOpsCard from "@/components/LiveOpsCard";
import AlertsTicker from "@/components/AlertsTicker";
import FloatingInstructionCard from "@/components/FloatingInstructionCard";
import AlertModal from "@/components/AlertModal";
import AlertsListModal from "@/components/AlertsListModal";
import { Alert, Aggregate, FlaggedRequest } from "@/types";
import { mockFlaggedRequests } from "@/lib/mock-data";

// Dynamic import for map to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [flaggedRequests, setFlaggedRequests] = useState<FlaggedRequest[]>(mockFlaggedRequests);
  const [aggregate, setAggregate] = useState<Aggregate | null>(null);
  const [timeWindow, setTimeWindow] = useState("last_60m");
  const [channels, setChannels] = useState<string[]>(["call", "chat", "survey"]);
  const [showFlaggedRequests, setShowFlaggedRequests] = useState(false);
  const [showAlertsList, setShowAlertsList] = useState(false);

  // Fetch alerts
  useEffect(() => {
    fetch(`/api/alerts?status=pending&window=${timeWindow}`)
      .then((res) => res.json())
      .then((data: Alert[]) => setAlerts(data))
      .catch(console.error);
  }, [timeWindow]);

  // Fetch aggregate data when region is selected
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

  // Filter flagged requests by selected region and status
  const filteredRequests = flaggedRequests
    .filter((req) => req.status === "pending")
    .filter((req) => selectedRegion ? req.region === selectedRegion : true);

  const highPriorityCount = filteredRequests.filter((req) => req.urgency === "HIGH").length;

  const handleRegionClick = (regionName: string) => {
    setSelectedRegion(regionName);
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

  const handleReviewRequest = (requestId: string) => {
    console.log("Review request:", requestId);
    // Open detailed view or mark as reviewed
    setFlaggedRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "reviewed" as const } : req
      )
    );
  };

  const handleEscalateRequest = (requestId: string) => {
    console.log("Escalate request:", requestId);
    setFlaggedRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "escalated" as const } : req
      )
    );
  };

  const handleDismissRequest = (requestId: string) => {
    console.log("Dismiss request:", requestId);
    setFlaggedRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "dismissed" as const } : req
      )
    );
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
        />

        {/* Floating cards overlay the map */}
        {!selectedRegion && !aggregate && <FloatingInstructionCard />}

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
        {filteredRequests.length > 0 && !showFlaggedRequests && (
          <FlaggedRequestsButton
            count={filteredRequests.length}
            highPriorityCount={highPriorityCount}
            onClick={() => setShowFlaggedRequests(true)}
          />
        )}

        {/* Flagged requests modal - shows when button is clicked */}
        {showFlaggedRequests && (
          <FlaggedRequestsCard
            requests={filteredRequests}
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