"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, eachDayOfInterval } from "date-fns";
import type { BurndownSnapshot } from "@prisma/client";

interface BurndownChartProps {
  snapshots: BurndownSnapshot[];
  startDate: Date | null;
  endDate: Date | null;
  totalPoints: number;
}

export function BurndownChart({ snapshots, startDate, endDate, totalPoints }: BurndownChartProps) {
  if (!startDate || !endDate) {
    return <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Sprint not started yet</div>;
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const sprintDuration = days.length;

  const data = days.map((day, idx) => {
    const snapshot = snapshots.find(
      (s) => format(new Date(s.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    );
    const ideal = Math.max(0, totalPoints - (totalPoints / (sprintDuration - 1)) * idx);
    return {
      date: format(day, "MMM d"),
      ideal: Math.round(ideal),
      actual: snapshot?.remainingPoints ?? null,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
        <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
        <Tooltip
          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
        />
        <Legend />
        <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="Ideal" />
        <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls name="Actual" />
      </LineChart>
    </ResponsiveContainer>
  );
}
