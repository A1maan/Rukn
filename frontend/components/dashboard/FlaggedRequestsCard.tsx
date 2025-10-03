"use client";

import { FlaggedRequest } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { Phone, MessageCircle, FileText, AlertCircle, X } from "lucide-react";

interface FlaggedRequestsCardProps {
  requests: FlaggedRequest[];
  onReview: (id: string) => void;
  onEscalate: (id: string) => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
}

export default function FlaggedRequestsCard({
  requests,
  onReview,
  onEscalate,
  onDismiss,
  onClose,
}: FlaggedRequestsCardProps) {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "call":
        return <Phone className="w-4 h-4" />;
      case "chat":
        return <MessageCircle className="w-4 h-4" />;
      case "survey":
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "HIGH":
        return "border-red-400 bg-red-50/90";
      case "MEDIUM":
        return "border-amber-400 bg-amber-50/90";
      case "LOW":
        return "border-green-400 bg-green-50/90";
      default:
        return "border-gray-400 bg-gray-50/90";
    }
  };

  return (
    <>
      {/* Centered floating panel (no backdrop) */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[660px] max-w-[85vw] h-[52vh] bg-white/90 backdrop-blur-sm rounded-2xl border border-amber-300 shadow-2xl p-6 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-7 h-7 text-red-600" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                Flagged Requests ({requests.length})
              </h3>
              <span className="text-sm text-gray-600">
                Requires supervisor review - Individual triage
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

      <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {(["HIGH", "MEDIUM", "LOW"] as const).map((urgencyKey) => {
            const items = requests
              .filter((r) => r.urgency === urgencyKey)
              .sort((a, b) => (a.ts < b.ts ? 1 : -1));
            if (items.length === 0) return null;

            const headerClasses = "bg-amber-50 border-amber-200";

            return (
              <section key={urgencyKey} className="min-h-0">
                <div className={`sticky top-0 z-10 px-4 py-2 border rounded-lg ${headerClasses}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-800">
                      {urgencyKey === "HIGH" ? "High Priority" : urgencyKey === "MEDIUM" ? "Medium Priority" : "Low Priority"} ({items.length})
                    </h4>
                    <span className="text-xs text-gray-600">Newest first</span>
                  </div>
                </div>

                <div className="mt-3 space-y-4">
                  {items.map((req) => (
                    <div key={req.id} className="border border-amber-200 rounded-xl bg-white p-6 shadow-sm hover:shadow transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-700">{req.region}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDateTime(req.ts, "en-US")}</span>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">{req.urgency}</span>
                      </div>

                      <div className="bg-white/80 border border-amber-200 rounded-lg p-5 mb-5 font-ar" dir="rtl">
                        <p className="text-gray-900 text-lg leading-relaxed">{req.text_preview}</p>
                      </div>

                      <div className="flex items-center gap-6 mb-2 text-sm">
                        <span className="text-gray-700"><span className="font-semibold">Topic:</span> <span className="capitalize">{req.category.replace(/_/g, " ")}</span></span>
                      </div>

                      <div className="flex items-center gap-6 mb-5 text-sm">
                        <span className="text-gray-700"><span className="font-semibold">Confidence:</span> {(req.confidence * 100).toFixed(0)}%</span>
                        <span className={`font-semibold capitalize ${
                          req.emotion === "distress" ? "text-red-600" :
                          req.emotion === "anger" ? "text-orange-600" :
                          req.emotion === "sadness" ? "text-purple-600" :
                          "text-green-600"
                        }`}>{req.emotion}</span>
                      </div>

                      <div className="flex gap-4">
                        <button onClick={() => onReview(req.id)} className="flex-1 px-5 py-2 bg-amber-600 text-white rounded-md text-xs font-semibold hover:bg-amber-700 transition-colors">Review</button>
                        <button onClick={() => onEscalate(req.id)} className="flex-1 px-5 py-2 bg-white border border-amber-500 text-amber-700 rounded-md text-xs font-semibold hover:bg-amber-50 transition-colors">Escalate</button>
                        <button onClick={() => onDismiss(req.id)} className="px-5 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md text-xs font-semibold hover:bg-gray-200 transition-colors">Dismiss</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
      </div>
      </div>
    </>
  );
}
