"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import type { ProfileStats } from "@/types/generator";

const COLORS = ["#c9a227", "#b8451a", "#8a5fc9", "#5fa85f", "#d66f9e", "#5f9fd6"];

export function ClassDistributionChart({ data }: { data: ProfileStats["class_distribution"] }) {
  if (data.length === 0) {
    return <p className="text-forge-muted text-sm">Нет данных по классам.</p>;
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="name" outerRadius={90} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#1a1613", border: "1px solid #2e2620", color: "#e8ddc4" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CampaignsByMonthChart({ data }: { data: ProfileStats["campaigns_by_month"] }) {
  if (data.length === 0) {
    return <p className="text-forge-muted text-sm">Нет данных по месяцам.</p>;
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#2e2620" strokeDasharray="3 3" />
          <XAxis dataKey="month" stroke="#8a7d6d" />
          <YAxis stroke="#8a7d6d" allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#1a1613", border: "1px solid #2e2620", color: "#e8ddc4" }}
          />
          <Bar dataKey="count" fill="#c9a227" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}