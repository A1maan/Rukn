"use client";

import { Bell } from "lucide-react";

interface FloatingAlertBadgeProps {
  count: number;
  onClick: () => void;
}

export default function FloatingAlertBadge({ count, onClick }: FloatingAlertBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 left-6 z-30 bg-white/90 backdrop-blur-md border-2 border-red-400 rounded-lg px-3 py-2 shadow-lg hover:bg-red-50 transition-all hover:scale-105"
      title="View Pending Alerts"
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <Bell className="w-4 h-4 text-red-600" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-red-600">{count}</span>
      </div>
    </button>
  );
}

