import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from "recharts";

export default function WeightChart({ entries, unit = "kg" }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50 p-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
        </svg>
        <span className="text-sm font-semibold text-neutral-500">No weight entries logged yet</span>
        <span className="text-xs text-neutral-400 mt-1">Log your first weight to see the trend chart</span>
      </div>
    );
  }

  // Format data for the chart
  const data = entries.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    rawDate: entry.date,
    weight: entry.weight_display,
  }));

  // Calculate stats
  const weights = data.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const padding = (maxWeight - minWeight || 5) * 0.15;
  
  const yDomain = [
    Math.max(0, Math.floor(minWeight - padding)),
    Math.ceil(maxWeight + padding),
  ];

  const currentWeight = entries[entries.length - 1]?.weight_display;
  const initialWeight = entries[0]?.weight_display;
  const netChange = currentWeight - initialWeight;
  const changeColor = netChange < 0 ? "text-emerald-600 bg-emerald-50" : netChange > 0 ? "text-rose-600 bg-rose-50" : "text-neutral-500 bg-neutral-100";

  return (
    <div className="space-y-4">
      {/* Mini stats cards above chart */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel tint-violet p-4 border-indigo-100/40 hover-lift shadow-sm">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-0.5">Start</span>
          <span className="text-lg font-extrabold text-neutral-800">{initialWeight} <span className="text-xs font-semibold text-neutral-500">{unit}</span></span>
        </div>
        <div className="glass-panel tint-sky p-4 border-sky-100/40 hover-lift shadow-sm">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-0.5">Current</span>
          <span className="text-lg font-extrabold text-neutral-800">{currentWeight} <span className="text-xs font-semibold text-neutral-500">{unit}</span></span>
        </div>
        <div className="glass-panel tint-emerald p-4 border-emerald-100/40 hover-lift shadow-sm flex flex-col justify-center">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-0.5">Net Change</span>
          <span className={`inline-flex items-center gap-0.5 text-sm font-black px-2.5 py-1 rounded-lg w-fit ${changeColor}`}>
            {netChange > 0 ? "+" : ""}{netChange.toFixed(1)} {unit}
          </span>
        </div>
      </div>

      <div className="glass-panel tint-violet p-5 border-indigo-100/40 shadow-md h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              domain={yDomain}
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-neutral-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg border border-neutral-800">
                      <p className="font-semibold text-neutral-300">{payload[0].payload.rawDate}</p>
                      <p className="font-bold text-white mt-0.5">
                        Weight: <span className="text-violet-400">{payload[0].value} {unit}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--color-primary)"
              strokeWidth={3}
              dot={{ r: 4, stroke: "var(--color-primary)", strokeWidth: 2, fill: "#ffffff" }}
              activeDot={{ r: 6, stroke: "var(--color-primary)", strokeWidth: 2, fill: "var(--color-primary)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
