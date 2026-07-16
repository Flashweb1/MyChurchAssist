"use client";

import { useMemo } from "react";
import { useDarkMode } from "@/lib/dark-mode-context";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ChartData {
  name: string;
  attendance: number;
}

interface AttendanceChartProps {
  data?: ChartData[];
}

const defaultData: ChartData[] = [
  { name: "Week 1", attendance: 850 },
  { name: "Week 2", attendance: 880 },
  { name: "Week 3", attendance: 910 },
  { name: "Week 4", attendance: 890 },
  { name: "Week 5", attendance: 950 },
  { name: "Week 6", attendance: 986 },
];

export default function AttendanceChart({ data }: AttendanceChartProps) {
  const { darkMode } = useDarkMode();
  const chartData = data && data.length > 0 ? data : defaultData;

  const average = useMemo(
    () => Math.round(chartData.reduce((s, d) => s + d.attendance, 0) / chartData.length),
    [chartData],
  );
  const peak = useMemo(
    () => Math.max(...chartData.map((d) => d.attendance)),
    [chartData],
  );
  const trend = useMemo(() => {
    if (chartData.length < 2) return 0;
    const first = chartData[0].attendance;
    const last = chartData[chartData.length - 1].attendance;
    return Math.round(((last - first) / first) * 100);
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const value = payload[0].value;
    const idx = chartData.findIndex((d) => d.name === label);
    const prevValue = idx > 0 ? chartData[idx - 1].attendance : value;
    const diff = value - prevValue;
    const isUp = diff >= 0;

    return (
      <div
        className={`rounded-2xl backdrop-blur-xl shadow-2xl border p-5 min-w-[180px] ${
          darkMode
            ? "bg-slate-800/80 border-slate-700/50 text-slate-200"
            : "bg-white/80 border-slate-200 text-slate-900"
        }`}
      >
        <p className="text-xs font-medium opacity-60 mb-1">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
        <p
          className={`text-xs font-semibold mt-2 flex items-center gap-1.5 ${
            isUp ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isUp ? "+" : ""}
          {diff} vs last week
        </p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-6 shrink-0">
        <div>
          <span className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Average
          </span>
          <p className={`text-xl font-bold ${darkMode ? "text-slate-200" : "text-slate-900"}`}>
            {average.toLocaleString()}
          </p>
        </div>
        <div>
          <span className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Peak
          </span>
          <p className="text-xl font-bold text-emerald-500">{peak.toLocaleString()}</p>
        </div>
        <div>
          <span className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Trend
          </span>
          <p
            className={`text-xl font-bold flex items-center gap-1 ${
              trend >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trend >= 0 ? "+" : ""}
            {trend}%
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                <stop offset="50%" stopColor="#0A66FF" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#0A66FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="2 4"
              vertical={false}
              stroke={darkMode ? "#334155" : "#e2e8f0"}
              strokeWidth={1}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: darkMode ? "#94a3b8" : "#64748b" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: darkMode ? "#94a3b8" : "#64748b" }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: darkMode ? "#475569" : "#cbd5e1",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <ReferenceLine
              y={average}
              stroke={darkMode ? "#475569" : "#94a3b8"}
              strokeDasharray="6 4"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="attendance"
              stroke="#0A66FF"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#attendanceGradient)"
              animationBegin={0}
              animationDuration={1200}
              dot={{
                r: 4,
                fill: "#0A66FF",
                stroke: darkMode ? "#1e293b" : "#fff",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: "#0A66FF",
                stroke: "#8B5CF6",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
