"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useStatsQuery, useSettingsQuery } from "@/utils/hooks";
import { StatsPeriod, DiscretionaryBudget } from "@/utils/types";
import { shiftDate } from "./_components/chartHelpers";
import BudgetCard from "./_components/BudgetCard";
import PeriodSelector from "./_components/PeriodSelector";
import CurrencySelector from "./_components/CurrencySelector";
import StatsChart from "./_components/StatsChart";
import CategoryLegend from "./_components/CategoryLegend";
import Spinner from "@/utils/components/Spinner";
import BudgetModal from "./_components/BudgetModal";

export default function Stats() {
  // hooks
  const session = useSession();
  const email = session?.data?.user?.email;

  // states
  const [period, setPeriod] = useState<StatsPeriod>("month");
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [currentMonthSpent, setCurrentMonthSpent] = useState<number | null>(null);
  // modal
  const [budgetModal, setBudgetModal] = useState(false);

  // hooks that depend on states
  const dateParam = anchorDate.toISOString();
  const { data: statsData, isLoading, isError } = useStatsQuery(email, period, dateParam);
  const { data: settingsData } = useSettingsQuery(email);

  // calculate sum of discretionary budget items
  useEffect(() => {
    if (!statsData || !settingsData) return;
    if (statsData.period !== "month") return;

    const budget = settingsData.workspace.discretionaryBudget;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const spent = statsData.items
      .filter((item) => {
        if (item.currency !== budget.currency) return false;

        const itemDate = new Date(item.date);
        if (itemDate < monthStart || itemDate >= monthEnd) return false;

        const matchedBudgetCategory = budget.categoryObjects.find((budgetObj) => budgetObj.category === item.category);
        if (!matchedBudgetCategory) return false;

        return matchedBudgetCategory.subcategories.includes("all") || matchedBudgetCategory.subcategories.includes(item.subcategory);
      })
      .reduce((sum, item) => sum + item.cost, 0);
    setCurrentMonthSpent(spent);
  }, [!!statsData, settingsData?.workspace.discretionaryBudget]);

  const currencies = useMemo(() => {
    if (!statsData) return [];
    const set = new Set(statsData.items.map((i) => i.currency));
    const sorted = Array.from(set).sort();
    if (set.has(statsData.defaultCurrency)) {
      return [statsData.defaultCurrency, ...sorted.filter((c) => c !== statsData.defaultCurrency)];
    }
    return sorted;
  }, [statsData]);

  useEffect(() => {
    if (!statsData) return;
    if (selectedCurrency && currencies.includes(selectedCurrency)) return;
    setSelectedCurrency(currencies.includes(statsData.defaultCurrency) ? statsData.defaultCurrency : currencies[0] ?? null);
  }, [statsData, currencies]);

  const activeCurrency = selectedCurrency ?? statsData?.defaultCurrency ?? "USD";

  const filteredItems = useMemo(() => {
    if (!statsData) return [];
    return statsData.items.filter((i) => i.currency === activeCurrency);
  }, [statsData, activeCurrency]);

  const filteredData = useMemo(() => {
    if (!statsData) return null;
    return { ...statsData, items: filteredItems };
  }, [statsData, filteredItems]);

  const onPrev = useCallback(() => setAnchorDate((d) => shiftDate(d, period, -1)), [period]);
  const onNext = useCallback(() => setAnchorDate((d) => shiftDate(d, period, 1)), [period]);

  const handleSetPeriod = useCallback((p: StatsPeriod) => {
    setPeriod(p);
    setAnchorDate(new Date());
  }, []);

  return (
    <div className="appPageContainer relative z-0">
      <div className="z-10 w-full pageContentMaxWidth py-4 portrait:sm:py-6 landscape:lg:py-6 flex flex-col items-center gap-4">
        <BudgetCard
          discretionaryBudget={settingsData?.workspace.discretionaryBudget}
          monthlySpent={currentMonthSpent}
          setBudgetModal={setBudgetModal}
        />

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
              <div className="w-full h-full flex items-center justify-center text-textError textBase">Failed to load stats</div>
            ) : filteredData ? (
              <StatsChart data={filteredData} currency={activeCurrency} />
            ) : null}
          </div>
        </div>

        {/* --- pie chart --- */}
        {filteredItems.length > 0 && (
          <div className="w-full rounded-2xl border border-borderFaint bg-card p-4">
            <CategoryLegend items={filteredItems} currency={activeCurrency} />
          </div>
        )}
      </div>
      {budgetModal && settingsData && (
        <BudgetModal
          workspaceId={settingsData.workspace._id}
          discretionaryBudget={settingsData.workspace.discretionaryBudget}
          categoryObjects={settingsData.workspace.categoryObjects}
          setBudgetModal={setBudgetModal}
        />
      )}
    </div>
  );
}
