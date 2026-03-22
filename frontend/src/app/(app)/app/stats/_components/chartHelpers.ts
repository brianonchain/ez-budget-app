import { StatsRawItem, StatsPeriod } from "@/utils/types";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type ChartBar = {
  label: string;
  tooltipLabel: string;
  total: number;
  [category: string]: string | number;
};

export function buildChartData(
  items: StatsRawItem[],
  period: StatsPeriod,
  startDate: string,
  groupBy: "category" | "subcategory" = "category"
): { bars: ChartBar[]; categories: string[] } {
  const start = new Date(startDate);
  const categorySet = new Set<string>();

  // bucket map: bucketKey -> { groupLabel -> sum }
  const buckets = new Map<string, Map<string, number>>();

  for (const item of items) {
    const d = new Date(item.date);
    const raw = groupBy === "subcategory" ? item.subcategory : item.category;
    const cat = raw === "none" ? "Uncategorized" : raw;
    categorySet.add(cat);

    let key: string;
    if (period === "year") {
      key = String(d.getMonth());
    } else {
      key = String(d.getDate());
    }

    if (!buckets.has(key)) buckets.set(key, new Map());
    const catMap = buckets.get(key)!;
    catMap.set(cat, (catMap.get(cat) || 0) + item.cost);
  }

  const categories = Array.from(categorySet).sort();
  const bars: ChartBar[] = [];

  if (period === "week") {
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = String(d.getDate());
      const tooltipLabel = `${DAY_LABELS[i]}, ${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
      const bar: ChartBar = { label: DAY_LABELS[i], tooltipLabel, total: 0 };
      const catMap = buckets.get(key);
      for (const cat of categories) {
        const val = catMap?.get(cat) || 0;
        bar[cat] = val;
        bar.total += val;
      }
      bars.push(bar);
    }
  } else if (period === "month") {
    const year = start.getFullYear();
    const month = start.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const key = String(day);
      const tooltipLabel = `${MONTH_LABELS[month]} ${day}`;
      const bar: ChartBar = { label: String(day), tooltipLabel, total: 0 };
      const catMap = buckets.get(key);
      for (const cat of categories) {
        const val = catMap?.get(cat) || 0;
        bar[cat] = val;
        bar.total += val;
      }
      bars.push(bar);
    }
  } else {
    for (let m = 0; m < 12; m++) {
      const key = String(m);
      const tooltipLabel = `${MONTH_LABELS[m]} ${start.getFullYear()}`;
      const bar: ChartBar = { label: MONTH_LABELS[m], tooltipLabel, total: 0 };
      const catMap = buckets.get(key);
      for (const cat of categories) {
        const val = catMap?.get(cat) || 0;
        bar[cat] = val;
        bar.total += val;
      }
      bars.push(bar);
    }
  }

  return { bars, categories };
}

const CATEGORY_PALETTE = [
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
  "#6366f1", // indigo-500
  "#84cc16", // lime-500
  "#a855f7", // purple-500
];

export function getCategoryColor(index: number): string {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
}

export function formatPeriodLabel(period: StatsPeriod, anchorDate: Date): string {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  if (period === "week") {
    const day = anchorDate.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(anchorDate);
    monday.setDate(anchorDate.getDate() - diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${fmt(monday)}-${fmt(sunday)}, ${sunday.getFullYear()}`;
  }
  if (period === "month") {
    return `${months[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
  }
  return String(anchorDate.getFullYear());
}

export function shiftDate(current: Date, period: StatsPeriod, direction: -1 | 1): Date {
  const d = new Date(current);
  if (period === "week") {
    d.setDate(d.getDate() + direction * 7);
  } else if (period === "month") {
    d.setMonth(d.getMonth() + direction);
  } else {
    d.setFullYear(d.getFullYear() + direction);
  }
  return d;
}
