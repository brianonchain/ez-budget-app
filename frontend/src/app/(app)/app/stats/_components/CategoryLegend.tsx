"use client";
import { useMemo } from "react";
import { StatsRawItem } from "@/utils/types";
import { SYMBOLS, DECIMALS } from "@/utils/constants";
import { getCategoryColor } from "./chartHelpers";

interface CategoryLegendProps {
  items: StatsRawItem[];
  currency: string;
}

export default function CategoryLegend({ items, currency }: CategoryLegendProps) {
  const categorySums = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const cat = item.category === "none" ? "Uncategorized" : item.category;
      map.set(cat, (map.get(cat) || 0) + item.cost);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, total]) => ({ name, total }));
  }, [items]);

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((i) => (i.category === "none" ? "Uncategorized" : i.category)))).sort();
  }, [items]);

  const symbol = SYMBOLS[currency] || "$";
  const decimals = DECIMALS[currency] ?? 2;
  const grandTotal = categorySums.reduce((s, c) => s + c.total, 0);

  if (categorySums.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex items-center justify-between textBaseApp font-semibold">
        <span>Total</span>
        <span>{symbol + grandTotal.toFixed(decimals)}</span>
      </div>
      <div className="flex flex-col gap-1">
        {categorySums.map((cat) => {
          const colorIndex = categories.indexOf(cat.name);
          return (
            <div key={cat.name} className="flex items-center gap-2 text-sm desktop:text-xs">
              <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ backgroundColor: getCategoryColor(colorIndex) }} />
              <span className="flex-1 text-text2 truncate">{cat.name}</span>
              <span className="font-medium tabular-nums">{symbol + cat.total.toFixed(decimals)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
