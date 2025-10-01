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
      className="fixed top-6 right-6 z-30 bg-white/90 backdrop-blur-md border-2 border-red-400 rounded-xl px-5 py-3 shadow-xl hover:bg-red-50 transition-all hover:scale-105"
    >
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 text-red-600" />
        <div className="text-left">
          <div className="text-2xl font-bold text-red-600">{count}</div>
          <div className="text-xs text-gray-600">Pending Alerts</div>
        </div>
      </div>
    </button>
  );
}
