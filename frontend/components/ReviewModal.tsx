"use client";

import { FlaggedRequest } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { X, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface ReviewModalProps {
  request: FlaggedRequest;
  onClose: () => void;
  onSubmit: (requestId: string, reviewedBy: string, reviewNotes: string) => void;
}

export default function ReviewModal({
  request,
  onClose,
  onSubmit,
}: ReviewModalProps) {
  const [reviewedBy, setReviewedBy] = useState("NCMH Admin");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reviewNotes.trim()) {
      alert("Please enter review notes");
      return;
    }

    setIsSubmitting(true);
    await onSubmit(request.id, reviewedBy, reviewNotes);
    setIsSubmitting(false);
  };

  const formatRegionName = (region: string) => {
    return region
      .toLowerCase()
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Review Flagged Request</h2>
              <p className="text-sm text-gray-600 mt-1">Add your review notes and submit</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Request Details */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{formatRegionName(request.region)}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDateTime(request.ts, "en-US")}</span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                  request.urgency === "HIGH" ? "bg-red-100 text-red-800 border border-red-300" :
                  request.urgency === "MEDIUM" ? "bg-amber-100 text-amber-800 border border-amber-300" :
                  "bg-green-100 text-green-800 border border-green-300"
                }`}>
                  {request.urgency}
                </span>
              </div>

              <div className="bg-white border border-amber-200 rounded-lg p-4 mb-4 font-ar" dir="rtl">
                <p className="text-gray-900 text-lg leading-relaxed">{request.text_preview}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Topic:</span>{" "}
                  <span className="capitalize">{request.category.replace(/_/g, " ")}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Confidence:</span>{" "}
                  <span>{(request.confidence * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Emotion:</span>{" "}
                  <span className={`font-semibold capitalize ${
                    request.emotion === "distress" ? "text-red-600" :
                    request.emotion === "anger" ? "text-orange-600" :
                    request.emotion === "sadness" ? "text-purple-600" :
                    "text-green-600"
                  }`}>
                    {request.emotion}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Channel:</span>{" "}
                  <span className="capitalize">{request.channel}</span>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reviewed By
                </label>
                <select
                  value={reviewedBy}
                  onChange={(e) => setReviewedBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="NCMH Admin">NCMH Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Review Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter your review notes here..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !reviewNotes.trim()}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
