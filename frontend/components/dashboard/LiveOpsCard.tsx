"use client";

import { useState, useEffect } from "react";
import { Aggregate } from "@/types";

interface LiveOpsCardProps {
  aggregate: Aggregate | null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function LiveOpsCard({ aggregate }: LiveOpsCardProps) {
  const [currentTime, setCurrentTime] = useState<string>("");

  // Update time only on client-side to avoid hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    
    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);

  const region = aggregate?.region ?? "Nationwide";
  const calls = aggregate?.counts.calls ?? 320;
  const chats = aggregate?.counts.chats ?? 120;
  const ewi = aggregate?.ewi ?? 0.42;

  const agentsOnline = Math.max(8, Math.ceil((calls + chats) / 15));
  const callsQueue = Math.max(0, Math.ceil(calls * (ewi > 0.6 ? 0.04 : ewi > 0.45 ? 0.025 : 0.015)));
  const chatsQueue = Math.max(0, Math.ceil(chats * (ewi > 0.6 ? 0.05 : ewi > 0.45 ? 0.03 : 0.02)));
  const medianWait = ewi > 0.6 ? 210 : ewi > 0.45 ? 120 : 70; // seconds
  const sla = ewi > 0.6 ? 78 : ewi > 0.45 ? 86 : 92; // percent

  return (
    <div className="fixed bottom-6 left-6 z-20 w-[320px] bg-white/85 backdrop-blur-md rounded-xl border-2 border-amber-300 shadow-xl p-4">
      <div className="mb-3">
        <div className="text-sm text-gray-600">Live Ops</div>
        <div className="text-base font-semibold text-gray-800">{region}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-center">
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-2">
          <div className="text-xl font-bold text-gray-800">{agentsOnline}</div>
          <div className="text-xs text-gray-600">Agents online</div>
        </div>
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-2">
          <div className="text-xl font-bold text-gray-800">{formatTime(medianWait)}</div>
          <div className="text-xs text-gray-600">Median wait</div>
        </div>
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-2">
          <div className="text-lg font-bold text-blue-700">{callsQueue}</div>
          <div className="text-xs text-gray-700">Calls in queue</div>
        </div>
        <div className="rounded-lg bg-green-50 border border-green-200 p-2">
          <div className="text-lg font-bold text-green-700">{chatsQueue}</div>
          <div className="text-xs text-gray-700">Chats in queue</div>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
          <span>SLA (target 85%)</span>
          <span className="font-semibold">{sla}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-2 rounded-full bg-amber-500"
            style={{ width: `${Math.min(sla, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-3 border-t border-amber-200 pt-3 text-xs text-gray-700">
        <div className="mb-1 font-medium">EWI Legend</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" /> <span>Low &lt; 0.35</span></div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> <span>0.35–0.60</span></div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> <span>&gt; 0.60</span></div>
        </div>
        {currentTime && (
          <div className="mt-2 text-[10px] text-gray-500">Updated: {currentTime}</div>
        )}
      </div>
    </div>
  );
}


