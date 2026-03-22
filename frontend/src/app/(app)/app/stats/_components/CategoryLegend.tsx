"use client";
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { StatsRawItem } from "@/utils/types";
import { SYMBOLS, DECIMALS } from "@/utils/constants";
import { getCategoryColor } from "./chartHelpers";

interface CategoryLegendProps {
  items: StatsRawItem[];
  currency: string;
  groupBy?: "category" | "subcategory";
}

function PieTooltip({ active, payload, symbol, decimals }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="rounded-lg border border-borderFaint bg-card dark:bg-[#0B0F37] px-3 py-2 shadow-lg text-xs">
      <p className="font-medium mb-0.5">{name}</p>
      <p>{symbol + value.toFixed(decimals)}</p>
    </div>
  );
}

export default function CategoryLegend({ items, currency, groupBy = "category" }: CategoryLegendProps) {
  const { slices, categories, grandTotal } = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const raw = groupBy === "subcategory" ? item.subcategory : item.category;
      const cat = raw === "none" ? "Uncategorized" : raw;
      map.set(cat, (map.get(cat) || 0) + item.cost);
    }
    const getKey = (i: StatsRawItem) => {
      const raw = groupBy === "subcategory" ? i.subcategory : i.category;
      return raw === "none" ? "Uncategorized" : raw;
    };
    const cats = Array.from(new Set(items.map(getKey))).sort();
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
    return { slices: sorted, categories: cats, grandTotal: total };
  }, [items]);

  const symbol = SYMBOLS[currency] || "$";
  const decimals = DECIMALS[currency] ?? 2;

  if (slices.length === 0) return null;

  return (
    <div className="mx-auto flex items-center gap-4">
      {/* labels + totals */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between textBase font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{symbol + grandTotal.toFixed(decimals)}</span>
        </div>
        {slices.map((cat) => {
          const colorIndex = categories.indexOf(cat.name);
          return (
            <div key={cat.name} className="flex items-center gap-2 textSm">
              <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ backgroundColor: getCategoryColor(colorIndex) }} />
              <span className="flex-1 text-textSecondary truncate min-w-0">{cat.name}</span>
              <span className="ml-6 font-medium tabular-nums shrink-0">{symbol + cat.value.toFixed(decimals)}</span>
            </div>
          );
        })}
      </div>

      {/* pie chart */}
      <div className="shrink-0 w-[120px] h-[120px] portrait:sm:w-[140px] portrait:sm:h-[140px] landscape:lg:w-[140px] landscape:lg:h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="35%"
              outerRadius="80%"
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
    </div>
  );
}
