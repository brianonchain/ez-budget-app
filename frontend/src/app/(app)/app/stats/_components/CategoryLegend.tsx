"use client";
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { StatsRawItem } from "@/utils/types";
import { SYMBOLS, DECIMALS } from "@/utils/constants";
import { getCategoryColor } from "./chartHelpers";

interface CategoryLegendProps {
  items: StatsRawItem[];
  currency: string;
}

function PieTooltip({ active, payload, symbol, decimals }: any) {
  if (!active || !payload?.length) return null;
  const { name, value, percent } = payload[0].payload;
  return (
    <div className="rounded-lg border border-borderFaint bg-card dark:bg-[#0B0F37] px-3 py-2 shadow-lg text-xs">
      <p className="font-medium mb-0.5">{name}</p>
      <p>
        {symbol + value.toFixed(decimals)} ({(percent * 100).toFixed(1)}%)
      </p>
    </div>
  );
}

export default function CategoryLegend({ items, currency }: CategoryLegendProps) {
  const { slices, categories, grandTotal } = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const cat = item.category === "none" ? "Uncategorized" : item.category;
      map.set(cat, (map.get(cat) || 0) + item.cost);
    }
    const cats = Array.from(new Set(items.map((i) => (i.category === "none" ? "Uncategorized" : i.category)))).sort();
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, percent: total > 0 ? value / total : 0 }));
    return { slices: sorted, categories: cats, grandTotal: total };
  }, [items]);

  const symbol = SYMBOLS[currency] || "$";
  const decimals = DECIMALS[currency] ?? 2;

  if (slices.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* pie chart */}
      <div className="w-full h-[200px] portrait:sm:h-[240px] landscape:lg:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="75%"
              paddingAngle={1}
              strokeWidth={0}
            >
              {slices.map((s) => (
                <Cell key={s.name} fill={getCategoryColor(categories.indexOf(s.name))} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip symbol={symbol} decimals={decimals} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* legend */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between textBase font-semibold">
          <span>Total</span>
          <span>{symbol + grandTotal.toFixed(decimals)}</span>
        </div>
        <div className="flex flex-col gap-1">
          {slices.map((cat) => {
            const colorIndex = categories.indexOf(cat.name);
            return (
              <div key={cat.name} className="flex items-center gap-2 text-sm desktop:text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ backgroundColor: getCategoryColor(colorIndex) }} />
                <span className="flex-1 text-textSecondary truncate">{cat.name}</span>
                <span className="text-textSecondary tabular-nums mr-1">({(cat.percent * 100).toFixed(1)}%)</span>
                <span className="font-medium tabular-nums">{symbol + cat.value.toFixed(decimals)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
