"use client";

import { MapPin, X } from "lucide-react";

interface FloatingInstructionCardProps {
  onClose?: () => void;
}

export default function FloatingInstructionCard({ onClose }: FloatingInstructionCardProps) {
  return (
    <div className="floating-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-amber-400 shadow-2xl p-10 text-center max-w-lg relative">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors group"
          aria-label="Close instruction"
        >
          <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        </button>
      )}
      
      <div className="mb-4 flex justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">
        Click on a Province
      </h3>
      <p className="text-gray-600 mb-6 text-base">
        Select any province to view volume stats, sentiment distribution, and flagged requests requiring review.
      </p>
      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span>Low Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span>High Risk</span>
        </div>
      </div>
    </div>
  );
}
