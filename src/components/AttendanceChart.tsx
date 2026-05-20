"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

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
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0A66FF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0A66FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            backgroundColor: "#ffffff",
          }}
          labelStyle={{ color: "#0f172a", fontWeight: "600" }}
          formatter={(value: number) => [`${value} attendees`, "Attendance"]}
          labelFormatter={(label) => `Week: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="attendance"
          stroke="#0A66FF"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorAttendance)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
