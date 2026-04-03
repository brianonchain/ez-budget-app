"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useStatsQuery, useSettingsQuery, useItemsQuery } from "@/utils/hooks";
// components
import BudgetCard from "./_components/BudgetCard";
import PeriodSelector from "./_components/PeriodSelector";
import CategoryLegend from "./_components/CategoryLegend";
import BarChart from "./_components/BarChart";
import BudgetModal from "./_components/BudgetModal";
import Spinner from "@/utils/components/Spinner";
import Card from "@/utils/components/Card";
// functions
import { shiftDate } from "./_components/chartHelpers";
import { getMonthKey } from "@/utils/functions";
// types
import { StatsPeriod } from "@/utils/types";

export default function Stats() {
  // hooks
  const session = useSession();
  const email = session?.data?.user?.email;

  // states
  const [period, setPeriod] = useState<StatsPeriod>("month");
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [currentMonthSpent, setCurrentMonthSpent] = useState<number | null>(null);
  // modal
  const [budgetModal, setBudgetModal] = useState(false);

  // hooks that depend on states
  const dateParam = anchorDate.toISOString();
  const { data: itemsData } = useItemsQuery();
  const { data: statsData, isLoading, isError } = useStatsQuery(email, period, dateParam);
  const { data: settingsData } = useSettingsQuery(itemsData?.pages[0]?.activeWorkspaceId ?? null);

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
    let items = statsData.items.filter((i) => i.currency === activeCurrency);
    if (selectedCategory !== "all") items = items.filter((i) => i.category === selectedCategory);
    if (selectedTag !== "all") items = items.filter((i) => i.tag === selectedTag);
    return items;
  }, [statsData, activeCurrency, selectedCategory, selectedTag]);

  const groupBy = selectedCategory !== "all" ? "subcategory" : "category";

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
    <div className="w-full pageContentMaxWidth px-4 py-4 portrait:sm:py-6 landscape:lg:py-6 flex flex-col items-center gap-4">
      <Card className="relative flex flex-col items-center">
        <div className="font-semibold text-textSecondary">Discretionary Budget</div>
        <BudgetCard
          discretionaryBudget={settingsData?.workspace.discretionaryBudget}
          monthlySpent={currentMonthSpent}
          setBudgetModal={setBudgetModal}
        />
      </Card>

      <Card className="flex flex-col items-center">
        <PeriodSelector
          period={period}
          setPeriod={handleSetPeriod}
          anchorDate={anchorDate}
          onPrev={onPrev}
          onNext={onNext}
          currencies={currencies}
          activeCurrency={activeCurrency}
          onSelectCurrency={setSelectedCurrency}
          categoryObjects={settingsData?.workspace.categoryObjects}
          tags={settingsData?.workspace.tags}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />
        {filteredItems.length > 0 && <CategoryLegend items={filteredItems} currency={activeCurrency} groupBy={groupBy} />}
        <div className="w-full">
          {isLoading ? (
            <div className="w-full h-80 flex items-center justify-center">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="w-full h-80 flex items-center justify-center text-textDanger">Failed to load stats</div>
          ) : filteredData ? (
            <BarChart data={filteredData} currency={activeCurrency} groupBy={groupBy} />
          ) : null}
        </div>
      </Card>

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
