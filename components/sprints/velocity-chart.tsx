"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VelocityChartProps {
  sprints: { id: string; name: string; velocity: number | null; completedAt: Date | null }[];
}

export function VelocityChart({ sprints }: VelocityChartProps) {
  if (sprints.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No completed sprints yet
      </div>
    );
  }

  const data = [...sprints].reverse().map((s) => ({
    name: s.name,
    velocity: s.velocity ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
        <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
        <Tooltip
          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
        />
        <Bar dataKey="velocity" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Points" />
      </BarChart>
    </ResponsiveContainer>
  );
}
