"use client";
import { useMemo } from "react";
import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts";
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
      .map(([name, value]) => ({ name, value, fill: getCategoryColor(cats.indexOf(name)) }));
    return { slices: sorted, categories: cats, grandTotal: total };
  }, [items, groupBy]);

  const symbol = SYMBOLS[currency] || "$";
  const decimals = DECIMALS[currency] ?? 2;

  if (slices.length === 0) return null;

  return (
    <div className="mt-6 lg:mt-8 w-full flex items-center justify-center gap-4 xs:gap-8">
      {/* labels + totals */}
      <div className="min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center justify-between font-semibold">
          <span className="">Total</span>
          <span className="shrink-0 tabular-nums">{symbol + grandTotal.toFixed(decimals)}</span>
        </div>
        {slices.map((cat) => {
          const colorIndex = categories.indexOf(cat.name);
          return (
            <div key={cat.name} className="flex items-center gap-2 textXs">
              <span className="shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(colorIndex) }} />
              <span className="flex-1 text-textSecondary truncate">{cat.name}</span>
              <span className="shrink-0 ml-2 font-medium tabular-nums shrink-0">{symbol + cat.value.toFixed(decimals)}</span>
            </div>
          );
        })}
      </div>

      {/* pie chart */}
      <div className="shrink-0 aspect-square w-[110px] portrait:sm:w-[140px] landscape:lg:w-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="100%"
              paddingAngle={1}
              strokeWidth={0}
            />
            <Tooltip content={<PieTooltip symbol={symbol} decimals={decimals} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
