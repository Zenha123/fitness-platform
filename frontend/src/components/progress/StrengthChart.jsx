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

export default function StrengthChart({ data, pr, unit = "kg", exerciseName }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50 p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
        </svg>
        <span className="text-sm font-semibold text-neutral-500">No logs found for this exercise</span>
        <span className="text-xs text-neutral-400 mt-1">
          Perform and log this exercise in your workouts to see progress charts.
        </span>
      </div>
    );
  }

  // Format data points
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    rawDate: d.date,
    weight: d.weight_display,
    isPR: pr && d.date === pr.date && d.weight_display === pr.weight_display,
  }));

  const weights = chartData.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const padding = (maxWeight - minWeight || 10) * 0.15;
  const yDomain = [
    Math.max(0, Math.floor(minWeight - padding)),
    Math.ceil(maxWeight + padding),
  ];

  const initialWeight = chartData[0]?.weight;
  const prWeight = pr?.weight_display || 0;
  const totalIncrease = prWeight - initialWeight;

  // Custom active dot to highlight PRs
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.isPR) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={8} fill="var(--color-accent-light)" stroke="var(--color-accent)" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={4} fill="var(--color-accent)" />
        </g>
      );
    }
    return <circle cx={cx} cy={cy} r={4} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={2} />;
  };

  return (
    <div className="space-y-6">
      {/* Exercise and PR Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-violet-200">Strength Progress</span>
          <h2 className="text-2xl font-black mt-0.5">{exerciseName || "Exercise"}</h2>
        </div>
        {pr && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-neutral-900 flex items-center justify-center text-lg font-bold shadow-sm">
              🏆
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-violet-200 tracking-wider">Personal Record</span>
              <p className="text-lg font-black leading-none mt-1">
                {prWeight} <span className="text-xs font-semibold text-violet-200">{unit}</span>
              </p>
              <p className="text-[10px] text-violet-100 font-semibold mt-0.5">
                Achieved: {new Date(pr.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">Starting Weight</span>
          <span className="text-lg font-bold text-neutral-800">{initialWeight} <span className="text-xs font-semibold text-neutral-500">{unit}</span></span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">All-Time Max</span>
          <span className="text-lg font-bold text-neutral-800">{prWeight} <span className="text-xs font-semibold text-neutral-500">{unit}</span></span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">Net Increase</span>
          <span className={`inline-flex items-center gap-0.5 text-sm font-bold px-2 py-0.5 rounded-lg ${totalIncrease > 0 ? "text-emerald-600 bg-emerald-50" : "text-neutral-500 bg-neutral-100"}`}>
            +{totalIncrease.toFixed(1)} {unit}
          </span>
        </div>
      </div>

      {/* Recharts LineChart */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
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
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-neutral-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg border border-neutral-800">
                      <p className="font-semibold text-neutral-300">{item.rawDate}</p>
                      <p className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                        Weight: <span className="text-violet-400">{payload[0].value} {unit}</span>
                        {item.isPR && <span className="bg-amber-500 text-neutral-900 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">🏆 PR</span>}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {pr && (
              <ReferenceLine
                y={prWeight}
                stroke="var(--color-accent)"
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{
                  value: "All-time PR",
                  position: "top",
                  fill: "var(--color-accent)",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--color-primary)"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 6, stroke: "var(--color-primary)", strokeWidth: 2, fill: "var(--color-primary)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
