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
import Card from "@/utils/components/Card";
import { getMonthKey } from "@/utils/functions";

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
  const runCalculation = statsData?.period === "month" && getMonthKey(new Date(statsData.startDate)) === getMonthKey(new Date());
  useEffect(() => {
    if (!runCalculation || !statsData || !settingsData) return;
    const budget = settingsData.workspace.discretionaryBudget;
    const spent = statsData.items
      .filter((item) => {
        if (item.currency !== budget.currency) return false;
        const budgetCategoryObject = budget.categoryObjects.find((budgetObj) => budgetObj.category === item.category);
        if (!budgetCategoryObject) return false;
        if (budgetCategoryObject.subcategories[0] === "all") return true;
        if (budgetCategoryObject.subcategories.includes(item.subcategory)) return true;
        return false;
      })
      .reduce((sum, item) => sum + item.cost, 0);
    setCurrentMonthSpent(spent);
  }, [runCalculation, settingsData?.workspace.discretionaryBudget]);

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

        {/* combined chart card */}
        <Card className="flex flex-col gap-6">
          <PeriodSelector period={period} setPeriod={handleSetPeriod} anchorDate={anchorDate} onPrev={onPrev} onNext={onNext} />
          {currencies.length > 1 && <CurrencySelector currencies={currencies} selected={activeCurrency} onSelect={setSelectedCurrency} />}
          {filteredItems.length > 0 && <CategoryLegend items={filteredItems} currency={activeCurrency} />}
          <div className="w-full h-[200px] portrait:sm:h-[240px] landscape:lg:h-[240px]">
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
        </Card>
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
