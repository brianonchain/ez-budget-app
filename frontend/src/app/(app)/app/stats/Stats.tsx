"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useStatsQuery, useSettingsQuery } from "@/utils/hooks";
import { StatsPeriod, MonthlyBudget } from "@/utils/types";
import { getMonthKey } from "@/utils/functions";
import { shiftDate } from "./_components/chartHelpers";
import BudgetCard from "./_components/BudgetCard";
import PeriodSelector from "./_components/PeriodSelector";
import CurrencySelector from "./_components/CurrencySelector";
import StatsChart from "./_components/StatsChart";
import CategoryLegend from "./_components/CategoryLegend";
import Spinner from "@/utils/components/Spinner";

export default function Stats() {
  const session = useSession();
  const email = session?.data?.user?.email;
  const [period, setPeriod] = useState<StatsPeriod>("month");
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  const dateParam = anchorDate.toISOString();
  const { data, isLoading, isError } = useStatsQuery(email, period, dateParam);
  const { data: settingsData } = useSettingsQuery(email);

  const currentMonthKey = getMonthKey(new Date());
  const budget: MonthlyBudget | null = settingsData?.workspace.monthlyBudgets[currentMonthKey] ?? null;

  const monthlySpent = useMemo(() => {
    if (!data || !budget) return 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return data.items
      .filter((i) => i.currency === budget.currency && new Date(i.date) >= monthStart && new Date(i.date) < monthEnd)
      .reduce((sum, i) => sum + i.cost, 0);
  }, [data, budget]);

  const currencies = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.items.map((i) => i.currency));
    const sorted = Array.from(set).sort();
    if (set.has(data.defaultCurrency)) {
      return [data.defaultCurrency, ...sorted.filter((c) => c !== data.defaultCurrency)];
    }
    return sorted;
  }, [data]);

  useEffect(() => {
    if (!data) return;
    if (selectedCurrency && currencies.includes(selectedCurrency)) return;
    setSelectedCurrency(currencies.includes(data.defaultCurrency) ? data.defaultCurrency : currencies[0] ?? null);
  }, [data, currencies]);

  const activeCurrency = selectedCurrency ?? data?.defaultCurrency ?? "USD";

  const filteredItems = useMemo(() => {
    if (!data) return [];
    return data.items.filter((i) => i.currency === activeCurrency);
  }, [data, activeCurrency]);

  const filteredData = useMemo(() => {
    if (!data) return null;
    return { ...data, items: filteredItems };
  }, [data, filteredItems]);

  const onPrev = useCallback(() => setAnchorDate((d) => shiftDate(d, period, -1)), [period]);
  const onNext = useCallback(() => setAnchorDate((d) => shiftDate(d, period, 1)), [period]);

  const handleSetPeriod = useCallback((p: StatsPeriod) => {
    setPeriod(p);
    setAnchorDate(new Date());
  }, []);

  return (
    <div className="appPageContainer relative z-0">
      <div className="z-10 w-full max-w-[680px] flex flex-col items-center gap-4 px-4 py-4 portrait:sm:py-6 landscape:lg:py-6">
        {settingsData && budget && <BudgetCard workspaceId={settingsData.workspace._id} budget={budget} monthlySpent={monthlySpent} />}

        <PeriodSelector period={period} setPeriod={handleSetPeriod} anchorDate={anchorDate} onPrev={onPrev} onNext={onNext} />

        {currencies.length > 1 && <CurrencySelector currencies={currencies} selected={activeCurrency} onSelect={setSelectedCurrency} />}

        {/* chart container */}
        <div className="w-full rounded-2xl border border-borderFaint bg-card p-3 portrait:sm:p-4 landscape:lg:p-4">
          <div className="w-full h-[280px] portrait:sm:h-[340px] landscape:lg:h-[340px]">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Spinner />
              </div>
            ) : isError ? (
              <div className="w-full h-full flex items-center justify-center text-textError textBaseApp">Failed to load stats</div>
            ) : filteredData ? (
              <StatsChart data={filteredData} currency={activeCurrency} />
            ) : null}
          </div>
        </div>

        {/* category breakdown pie chart */}
        {filteredItems.length > 0 && (
          <div className="w-full rounded-2xl border border-borderFaint bg-card p-4">
            <CategoryLegend items={filteredItems} currency={activeCurrency} />
          </div>
        )}
      </div>
    </div>
  );
}
