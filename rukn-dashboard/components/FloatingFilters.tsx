"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";

interface FloatingFiltersProps {
  onWindowChange?: (window: string) => void;
  onChannelChange?: (channels: string[]) => void;
}

export default function FloatingFilters({
  onWindowChange,
  onChannelChange,
}: FloatingFiltersProps) {
  const [selectedWindow, setSelectedWindow] = useState("last_60m");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "call",
    "chat",
    "survey",
  ]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleWindowChange = (window: string) => {
    setSelectedWindow(window);
    onWindowChange?.(window);
  };

  const toggleChannel = (channel: string) => {
    const updated = selectedChannels.includes(channel)
      ? selectedChannels.filter((c) => c !== channel)
      : [...selectedChannels, channel];
    setSelectedChannels(updated);
    onChannelChange?.(updated);
  };

  if (!isExpanded) {
    // Compact button
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed top-6 left-6 z-30 bg-white/90 backdrop-blur-md border-2 border-amber-400 rounded-xl px-4 py-3 shadow-xl hover:bg-white transition-all hover:scale-105"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-amber-700" />
          <div className="text-left">
            <div className="text-sm font-bold text-gray-800">Filters</div>
            <div className="text-xs text-gray-600">
              {selectedWindow.replace("last_", "")} • {selectedChannels.length} channels
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Expanded panel
  return (
    <div className="fixed top-6 left-6 z-30 bg-white/95 backdrop-blur-md border-2 border-amber-400 rounded-xl p-5 shadow-2xl w-80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-amber-700" />
          <h3 className="font-bold text-gray-800">Filters</h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Time window */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-700 mb-2 block">
          Time Window
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "30m", value: "last_30m" },
            { label: "1h", value: "last_60m" },
            { label: "3h", value: "last_3h" },
            { label: "Today", value: "today" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleWindowChange(option.value)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors font-medium ${
                selectedWindow === option.value
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Channel filters */}
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-2 block">
          Channels
        </label>
        <div className="space-y-2">
          {[
            { label: "Calls", value: "call", color: "blue" },
            { label: "Chats", value: "chat", color: "green" },
            { label: "Surveys", value: "survey", color: "purple" },
          ].map((channel) => (
            <button
              key={channel.value}
              onClick={() => toggleChannel(channel.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg border-2 transition-all font-medium ${
                selectedChannels.includes(channel.value)
                  ? `bg-${channel.color}-50 border-${channel.color}-500 text-${channel.color}-700`
                  : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"
              }`}
            >
              {channel.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
