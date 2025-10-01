"use client";

import { Aggregate } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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

  return (
    <div className="floating-card absolute top-32 right-6 z-20 w-72 bg-white/90 backdrop-blur-md rounded-xl border-2 border-amber-300 shadow-xl p-4">
      <h3 className="text-sm font-bold text-gray-800 mb-2">
        Sentiment Distribution
      </h3>
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie
            data={sentimentData}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
            label={(entry) => `${(entry.value * 100).toFixed(0)}%`}
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
    </div>
  );
}
