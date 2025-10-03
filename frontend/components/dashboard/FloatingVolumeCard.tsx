"use client";

import { Aggregate } from "@/types";
import { getEWILabel, formatNumber } from "@/lib/utils";

interface FloatingVolumeCardProps {
  aggregate: Aggregate | null;
}

const TIME_WINDOWS: Record<string, string> = {
  last_30m: "Last 30 Minutes",
  last_60m: "Last Hour",
  last_3h: "Last 3 Hours",
  today: "Today",
};

export default function FloatingVolumeCard({ aggregate }: FloatingVolumeCardProps) {
  if (!aggregate) return null;

  const ewiLabel = getEWILabel(aggregate.ewi);

  return (
    <div className="floating-card absolute top-32 left-6 z-20 w-64 bg-white/90 backdrop-blur-md rounded-xl border-2 border-amber-300 shadow-xl p-4">
      {/* Header with region name and EWI */}
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-800">{aggregate.region}</h3>
        <div className="mt-1.5">
          <span className="text-xs font-medium text-gray-600">EWI:</span>
          <div className={`inline-block ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${ewiLabel.color}`}>
            {ewiLabel.text} ({(aggregate.ewi * 100).toFixed(0)}%)
          </div>
        </div>
      </div>

      {/* Volume counts */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 border border-gray-200">
          <div className="text-xl font-bold text-gray-800">
            {formatNumber(aggregate.counts.events)}
          </div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200">
          <div className="text-lg font-bold text-blue-700">
            {formatNumber(aggregate.counts.calls)}
          </div>
          <div className="text-xs text-gray-700">Calls</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 border border-green-200">
          <div className="text-lg font-bold text-green-700">
            {formatNumber(aggregate.counts.chats)}
          </div>
          <div className="text-xs text-gray-700">Chats</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 border border-purple-200">
          <div className="text-lg font-bold text-purple-700">
            {formatNumber(aggregate.counts.surveys)}
          </div>
          <div className="text-xs text-gray-700">Surveys</div>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        {TIME_WINDOWS[aggregate.window] || aggregate.window}
      </div>
    </div>
  );
}
