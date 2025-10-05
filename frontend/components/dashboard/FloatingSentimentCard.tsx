"use client";

import { Aggregate } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, PieLabelRenderProps } from "recharts";

interface FloatingSentimentCardProps {
  aggregate: Aggregate | null;
}

export default function FloatingSentimentCard({ aggregate }: FloatingSentimentCardProps) {
  if (!aggregate) return null;

  const sentimentData = [
    { name: "Positive", value: aggregate.sentiment_pct.pos, color: "#10b981" },
    { name: "Neutral", value: aggregate.sentiment_pct.neu, color: "#6b7280" },
    { name: "Negative", value: aggregate.sentiment_pct.neg, color: "#ef4444" },
  ];

  // Check if there's no data (all values are 0 or undefined)
  const hasNoData = aggregate.counts.events === 0 || 
    sentimentData.every(item => !item.value || item.value === 0);

  return (
    <div className="floating-card absolute top-32 right-6 z-20 w-72 bg-white/90 backdrop-blur-md rounded-xl border-2 border-amber-300 shadow-xl p-4">
      <h3 className="text-sm font-bold text-gray-800 mb-2">
        Sentiment Distribution
      </h3>
      {hasNoData ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">No sentiment data</p>
            <p className="text-xs text-gray-400 mt-1">No events in this time window</p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
                label={(props: PieLabelRenderProps) => `${((props.value as number)).toFixed(0)}%`}
                labelLine={true}
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
