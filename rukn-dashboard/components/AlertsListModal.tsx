"use client";

import { Alert } from "@/types";
import { X, AlertTriangle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface AlertsListModalProps {
  alerts: Alert[];
  onClose: () => void;
  onAlertClick: (alert: Alert) => void;
}

export default function AlertsListModal({
  alerts,
  onClose,
  onAlertClick,
}: AlertsListModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-24 bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-[800px] z-50 bg-white/98 backdrop-blur-md rounded-2xl border-2 border-amber-400 shadow-2xl p-8 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-red-600" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                System Alerts ({alerts.length})
              </h3>
              <span className="text-sm text-gray-600">
                Pattern-based operational recommendations
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => {
                onClose();
                onAlertClick(alert);
              }}
              className="border-2 border-amber-300 rounded-xl p-5 hover:bg-amber-50 cursor-pointer transition-all hover:border-amber-500 hover:shadow-lg bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-red-600 mb-1">
                    {alert.region}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatDateTime(alert.ts)}
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    alert.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      : alert.status === "approved"
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {alert.status.toUpperCase()}
                </span>
              </div>

              <p className="text-base text-gray-800 font-semibold mb-3">
                {alert.summary}
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                <div className="text-xs font-semibold text-gray-700 mb-2">
                  Evidence:
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.entries(alert.evidence.z_scores).map(([metric, z]) => (
                    <span
                      key={metric}
                      className="text-xs bg-white px-2 py-1 rounded border border-amber-300"
                    >
                      <span className="capitalize">{metric.replace(/_/g, " ")}</span>:{" "}
                      <span className="font-bold text-red-600">+{z.toFixed(1)}σ</span>
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-600">
                  {alert.evidence.flagged_count} individual requests flagged
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  <span className="font-semibold">Confidence:</span>{" "}
                  {(alert.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-amber-700 font-medium">
                  Click to view recommendations →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
