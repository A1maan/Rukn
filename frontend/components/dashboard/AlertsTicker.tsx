"use client";

import { Alert } from "@/types";
import { formatDateTime } from "@/lib/utils";

interface AlertsTickerProps {
  alerts: Alert[];
  onClickMore?: () => void;
  onSelect?: (a: Alert) => void;
}

export default function AlertsTicker({ alerts, onClickMore, onSelect }: AlertsTickerProps) {
  const recent = alerts.slice(0, 3);

  return (
    <div className="fixed bottom-6 right-6 z-20 w-[360px] bg-white/85 backdrop-blur-md rounded-xl border-2 border-amber-300 shadow-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-800">Recent Alerts</div>
        <button
          className="text-xs text-amber-700 hover:underline"
          onClick={onClickMore}
        >
          View all
        </button>
      </div>

      <div className="space-y-2">
        {recent.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-2">No pending alerts</div>
        ) : (
          recent.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelect?.(a)}
              className="w-full text-left bg-white border border-amber-200 rounded-lg p-3 hover:bg-amber-50 transition"
            >
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="font-semibold text-gray-800">{a.region}</span>
                <span>{formatDateTime(a.ts)}</span>
              </div>
              <div className="text-sm text-gray-800 mt-1 line-clamp-2">{a.summary}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}


