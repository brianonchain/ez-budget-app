"use client";
import { useMemo, useRef, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Label } from "recharts";
import { StatsData } from "@/utils/types";
import { SYMBOLS, DECIMALS, CURRENCY_NAMES } from "@/utils/constants";
import { buildChartData, getCategoryColor } from "./chartHelpers";

interface StatsChartProps {
  data: StatsData;
  currency: string;
}

function CustomTooltip({ active, payload, currency }: any) {
  if (!active || !payload?.length) return null;
  const symbol = SYMBOLS[currency] || "$";
  const decimals = DECIMALS[currency] ?? 2;
  const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
  const tooltipLabel = payload[0]?.payload?.tooltipLabel ?? "";

  return (
    <div className="rounded-lg border border-borderFaint bg-card dark:bg-[#0B0F37] px-3 py-2 shadow-lg">
      <p className="font-medium text-sm mb-1">{tooltipLabel}</p>
      {payload
        .filter((entry: any) => entry.value > 0)
        .sort((a: any, b: any) => b.value - a.value)
        .map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ backgroundColor: entry.color }} />
            <span className="text-text2 flex-1">{entry.dataKey}</span>
            <span className="font-medium">{symbol + entry.value.toFixed(decimals)}</span>
          </div>
        ))}
      {payload.length > 1 && (
        <div className="border-t border-borderFaint mt-1 pt-1 text-xs font-semibold flex justify-between">
          <span>Total</span>
          <span>{symbol + total.toFixed(decimals)}</span>
        </div>
      )}
    </div>
  );
}

function CustomXTick({ x, y, payload, period, narrow }: any) {
  const val = payload.value;
  const num = Number(val);

  // week (Mon-Sun) and year (Jan-Dec): always show all labels
  if (period !== "month") {
    return (
      <text x={x} y={y} dy={14} textAnchor="middle" fontSize={13} fill="var(--color-text2)">
        {val}
      </text>
    );
  }

  // month: filter which day labels to show
  if (!isNaN(num)) {
    const step = narrow ? 5 : 2;
    if (num % step !== 0) return null;
  }

  return (
    <text x={x} y={y} dy={14} textAnchor="middle" fontSize={13} fill="var(--color-text2)">
      {val}
    </text>
  );
}

export default function StatsChart({ data, currency }: StatsChartProps) {
  const { bars, categories } = useMemo(() => buildChartData(data.items, data.period, data.startDate), [data]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => setChartWidth(entries[0].contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const decimals = DECIMALS[currency] ?? 2;
  const currencyLabel = CURRENCY_NAMES[currency] ?? currency;

  const maxTotal = Math.max(...bars.map((b) => b.total), 0);
  const isEmpty = bars.length === 0 || maxTotal === 0;
  const narrow = chartWidth < 450;

  // build Y-axis ticks excluding 0
  const yTicks = useMemo(() => {
    if (isEmpty) return [1];
    const step = Math.pow(10, Math.floor(Math.log10(maxTotal))) / 2 || 1;
    const ticks: number[] = [];
    for (let v = step; v <= maxTotal * 1.1; v += step) {
      ticks.push(Math.round(v));
    }
    return ticks.length > 0 ? ticks : [1];
  }, [maxTotal, isEmpty]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bars} margin={{ top: 8, right: 4, left: 12, bottom: 0 }} barCategoryGap={data.period === "month" ? "10%" : "20%"}>
          {yTicks.map((t) => (
            <ReferenceLine key={t} y={t} stroke="var(--color-borderFaint)" strokeDasharray="3 3" />
          ))}
          <XAxis
            dataKey="label"
            tick={<CustomXTick period={data.period} narrow={narrow} />}
            tickLine={false}
            axisLine={{ stroke: "var(--color-borderFaint)" }}
            interval={0}
          />
          <YAxis
            width={54}
            tick={{ fontSize: 13, fill: "var(--color-text2)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-borderFaint)" }}
            domain={[0, "auto"]}
            ticks={yTicks}
            tickFormatter={(v: number) => {
              if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
              if (v >= 1000) return (v / 1000).toFixed(v >= 10000 ? 0 : 1) + "k";
              return v.toFixed(decimals);
            }}
          >
            <Label value={currencyLabel} angle={-90} position="insideLeft" offset={-4} style={{ textAnchor: "middle", fontSize: 12, fill: "var(--color-text2)" }} />
          </YAxis>
          {!isEmpty && <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: "var(--color-borderFaint)", opacity: 0.5 }} />}
          {!isEmpty &&
            categories.map((cat, i) => (
              <Bar key={cat} dataKey={cat} stackId="stack" fill={getCategoryColor(i)} radius={i === categories.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]} />
            ))}
        </BarChart>
      </ResponsiveContainer>
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center text-text2 textBaseApp pointer-events-none">
          No expenses for this period
        </div>
      )}
    </div>
  );
}
