"use client";

import { FlaggedRequest } from "@/types";
import { AlertCircle, ChevronUp } from "lucide-react";

interface FlaggedRequestsButtonProps {
  count: number;
  highPriorityCount: number;
  onClick: () => void;
}

export default function FlaggedRequestsButton({
  count,
  highPriorityCount,
  onClick,
}: FlaggedRequestsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl shadow-2xl transition-all hover:scale-105 border-2 border-red-400"
    >
      <div className="flex items-center gap-4">
        <AlertCircle className="w-6 h-6 animate-pulse" />
        <div className="text-left">
          <div className="text-lg font-bold">
            {count} Flagged Request{count !== 1 ? "s" : ""}
          </div>
          <div className="text-sm opacity-90">
            {highPriorityCount} High Priority • Click to review
          </div>
        </div>
        <ChevronUp className="w-5 h-5 ml-2" />
      </div>
    </button>
  );
}
