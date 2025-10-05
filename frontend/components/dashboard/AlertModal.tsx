"use client";

import { useState } from "react";
import { Alert } from "@/types";
import { X, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface AlertModalProps {
  alert: Alert | null;
  onClose: () => void;
  onApprove?: (alertId: string, note?: string) => void;
  onReject?: (alertId: string, note?: string) => void;
}

export default function AlertModal({
  alert,
  onClose,
  onApprove,
  onReject,
}: AlertModalProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!alert) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "approve",
          notes: note 
        }),
      });

      if (response.ok) {
        onApprove?.(alert.id, note);
        setNote("");
        onClose();
      } else {
        const error = await response.json();
        console.error("Failed to approve alert:", error);
      }
    } catch (error) {
      console.error("Failed to approve alert:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "reject",
          notes: note 
        }),
      });

      if (response.ok) {
        onReject?.(alert.id, note);
        setNote("");
        onClose();
      } else {
        const error = await response.json();
        console.error("Failed to reject alert:", error);
      }
    } catch (error) {
      console.error("Failed to reject alert:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {alert.region} • Alert
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDateTime(alert.ts)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Status badge */}
            <div className="mt-4">
              <span
                className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${
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
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Summary
              </h3>
              <p className="text-gray-700">{alert.summary}</p>
            </div>

            {/* Evidence */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Why This Fired
              </h3>
              
              {/* Flagged count */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {alert.evidence.flagged_count} individual requests flagged
                </p>
              </div>

              {/* Z-scores */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Anomaly Scores (σ):
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(alert.evidence.z_scores).map(([metric, z]) => (
                    <div
                      key={metric}
                      className="bg-white px-3 py-1.5 rounded-lg border border-amber-300"
                    >
                      <span className="text-xs text-gray-600 capitalize">
                        {metric.replace(/_/g, " ")}:
                      </span>{" "}
                      <span className="text-sm font-bold text-red-600">
                        +{z.toFixed(1)}σ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top phrases (Arabic) */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Top Phrases (Arabic):
                </p>
                <div className="flex flex-wrap gap-2">
                  {alert.evidence.top_phrases.map((phrase, idx) => (
                    <span
                      key={idx}
                      className="bg-white px-3 py-1.5 rounded-lg text-sm text-gray-800 border border-amber-300"
                      dir="rtl"
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>

              {/* Window */}
              <p className="text-xs text-gray-600 mt-3">
                Window: <span className="font-semibold">{alert.evidence.window}</span>
              </p>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Recommended Actions
              </h3>
              <div className="space-y-3">
                {alert.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          rec.type === "staffing"
                            ? "bg-purple-100 text-purple-800"
                            : rec.type === "routing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {rec.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 flex-1">{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Note input (for pending alerts) */}
            {alert.status === "pending" && (
              <div>
                <label
                  htmlFor="note"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Add Note (optional)
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Add context or reason for decision..."
                />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Confidence:</span>{" "}
                {(alert.confidence * 100).toFixed(0)}%
              </div>

              {/* Action buttons */}
              {alert.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
