"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import ReviewModal from "@/components/ReviewModal";
import Toast, { useToast } from "@/components/dashboard/Toast";
import { Alert, Aggregate, FlaggedRequest } from "@/types";
import { useRealtimeRequests, useRealtimeAlerts, useRealtimeRegionStats } from "@/lib/useRealtimeSubscription";
import { supabase } from "@/lib/supabaseClient";

// Dynamic import for map to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/dashboard/MapView"), { ssr: false });

// Debounced refresh hook
function useDebouncedCallback(callback: () => void, delay = 1000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [flaggedRequests, setFlaggedRequests] = useState<FlaggedRequest[]>([]);
  const [reviewingRequest, setReviewingRequest] = useState<FlaggedRequest | null>(null);
  const [aggregate, setAggregate] = useState<Aggregate | null>(null);
  const [regionEWIs, setRegionEWIs] = useState<Record<string, number>>({});
  const [timeWindow, setTimeWindow] = useState("today");
  const [channels, setChannels] = useState<string[]>(["call", "chat", "survey"]);
  const [showFlaggedRequests, setShowFlaggedRequests] = useState(false);
  const [showAlertsList, setShowAlertsList] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  
  // Toast notifications
  const { toasts, showToast, removeToast } = useToast();

  // Fetch all regions' EWI data - wrapped in useCallback for real-time updates
  const fetchRegionEWIs = useCallback(() => {
    const channelsParam = channels.join(',');
    fetch(`/api/aggregates?window=${timeWindow}&channels=${channelsParam}`)
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
  }, [timeWindow, channels]);

  // Fetch alerts - wrapped in useCallback for real-time updates
  const fetchAlerts = useCallback(() => {
    fetch(`/api/alerts?status=pending&window=${timeWindow}`)
      .then((res) => res.json())
      .then((data: Alert[]) => setAlerts(data))
      .catch(console.error);
  }, [timeWindow]);

  // Fetch flagged requests - wrapped in useCallback for real-time updates
  const fetchFlaggedRequests = useCallback(() => {
    const params = new URLSearchParams({
      status: "pending",
      ...(selectedRegion && { region: selectedRegion })
    });
    
    fetch(`/api/flagged-requests?${params}`)
      .then((res) => res.json())
      .then((data: FlaggedRequest[]) => setFlaggedRequests(data))
      .catch(console.error);
  }, [selectedRegion]);

  // Fetch selected region aggregate - wrapped in useCallback for real-time updates
  const fetchRegionAggregate = useCallback(() => {
    if (!selectedRegion) {
      setAggregate(null);
      return;
    }

    const channelsParam = channels.join(',');
    fetch(`/api/aggregates?region=${encodeURIComponent(selectedRegion)}&window=${timeWindow}&channels=${channelsParam}`)
      .then((res) => res.json())
      .then((data: Aggregate) => setAggregate(data))
      .catch(console.error);
  }, [selectedRegion, timeWindow, channels]);

  // Create debounced versions of fetch functions to prevent excessive updates
  const debouncedFetchRegionEWIs = useDebouncedCallback(fetchRegionEWIs, 1000);
  const debouncedFetchAlerts = useDebouncedCallback(fetchAlerts, 1000);
  const debouncedFetchFlaggedRequests = useDebouncedCallback(fetchFlaggedRequests, 1000);
  const debouncedFetchRegionAggregate = useDebouncedCallback(fetchRegionAggregate, 1000);

  // Initial fetch for region EWIs
  useEffect(() => {
    fetchRegionEWIs();
  }, [fetchRegionEWIs]);

  // Initial fetch for alerts
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Initial fetch for flagged requests
  useEffect(() => {
    fetchFlaggedRequests();
  }, [fetchFlaggedRequests]);

  // Initial fetch for region aggregate
  useEffect(() => {
    fetchRegionAggregate();
  }, [fetchRegionAggregate]);

  // Monitor Supabase connection status
  useEffect(() => {
    const channel = supabase.channel('connection-status');
    
    channel
      .on('system', { event: 'error' }, () => {
        console.log('❌ Supabase connection error');
        setIsConnected(false);
        showToast('Real-time connection lost. Attempting to reconnect...', 'error');
      })
      .on('system', { event: 'connected' }, () => {
        console.log('✅ Supabase connected');
        setIsConnected(true);
        showToast('Real-time connection established', 'success');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showToast]);

  // 🔴 Real-time subscriptions using Supabase with debouncing
  // Updates region stats when new requests come in
  useRealtimeRegionStats(debouncedFetchRegionEWIs);

  // Updates alerts when alerts change
  useRealtimeAlerts(debouncedFetchAlerts);

  // Updates requests and aggregates when requests change
  useRealtimeRequests(() => {
    debouncedFetchFlaggedRequests();
    debouncedFetchRegionAggregate();
  });
  useRealtimeRequests(() => {
    fetchFlaggedRequests();
    fetchRegionAggregate();
  });

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
    // Find the request and open the review modal
    const request = flaggedRequests.find(req => req.id === requestId);
    if (request) {
      setReviewingRequest(request);
    }
  };

  const handleSubmitReview = async (requestId: string, reviewedBy: string, reviewNotes: string) => {
    try {
      const response = await fetch(`/api/flagged-requests?id=${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "reviewed",
          reviewed_by: reviewedBy,
          review_notes: reviewNotes
        }),
      });

      if (response.ok) {
        // Remove from list and close modal
        setFlaggedRequests((prev) => prev.filter((req) => req.id !== requestId));
        setReviewingRequest(null);
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
        <LiveOpsCard aggregate={aggregate} isConnected={isConnected} />
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

        {/* Review Modal - for reviewing flagged requests */}
        {reviewingRequest && (
          <ReviewModal
            request={reviewingRequest}
            onClose={() => setReviewingRequest(null)}
            onSubmit={handleSubmitReview}
          />
        )}
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type as 'info' | 'success' | 'warning' | 'error'}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}