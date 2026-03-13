"use client";
import { useState, useCallback } from "react";
import { MonthlyBudget } from "@/utils/types";
import { useSettingsMutation } from "@/utils/hooks";
import { CURRENCIES, SYMBOLS, DECIMALS } from "@/utils/constants";
import { getMonthKey } from "@/utils/functions";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";

interface BudgetCardProps {
  workspaceId: string;
  budget: MonthlyBudget;
  monthlySpent: number;
}

function formatAmount(amount: number, currency: string) {
  const sym = SYMBOLS[currency] ?? "";
  const dec = DECIMALS[currency] ?? 2;
  return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
}

export default function BudgetCard({ workspaceId, budget, monthlySpent }: BudgetCardProps) {
  const [editing, setEditing] = useState(false);
  const [draftAmount, setDraftAmount] = useState(String(budget.amount));
  const [draftCurrency, setDraftCurrency] = useState(budget.currency);
  const mutation = useSettingsMutation();

  const openEditor = useCallback(() => {
    setDraftAmount(String(budget.amount));
    setDraftCurrency(budget.currency);
    setEditing(true);
  }, [budget]);

  const save = useCallback(() => {
    const parsed = parseFloat(draftAmount);
    if (isNaN(parsed) || parsed < 0) return;
    const month = getMonthKey(new Date());
    mutation.mutate({ type: "setMonthlyBudget", workspaceId, month, amount: parsed, currency: draftCurrency });
    setEditing(false);
  }, [draftAmount, draftCurrency, workspaceId, mutation]);

  const remaining = budget.amount - monthlySpent;

  return (
    <div className="w-full rounded-2xl border border-borderFaint dark:border-blue-400/6 bg-transparent dark:bg-blue-400/5 px-4 py-3">
      {editing ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="textBaseApp font-semibold shrink-0">Monthly Budget</span>
          <select
            value={draftCurrency}
            onChange={(e) => setDraftCurrency(e.target.value)}
            className="h-9 desktop:h-7 rounded-lg border border-borderFaint bg-transparent text-text1 textBaseApp px-2 cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {SYMBOLS[c]} {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="any"
            value={draftAmount}
            onChange={(e) => setDraftAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            className="h-9 desktop:h-7 w-28 rounded-lg border border-borderFaint bg-transparent text-text1 textBaseApp px-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            autoFocus
          />
          <button
            onClick={save}
            disabled={mutation.isPending}
            className="h-9 w-9 desktop:h-7 desktop:w-7 flex items-center justify-center rounded-lg desktop:hover:bg-buttonTransBgHover active:bg-buttonTransBgHover cursor-pointer transition-colors text-textGreen"
          >
            <FiCheck className="text-base" />
          </button>
          <button
            onClick={() => setEditing(false)}
            className="h-9 w-9 desktop:h-7 desktop:w-7 flex items-center justify-center rounded-lg desktop:hover:bg-buttonTransBgHover active:bg-buttonTransBgHover cursor-pointer transition-colors text-text2"
          >
            <FiX className="text-base" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-text2">Monthly Budget</span>
            <span className="textBaseApp font-semibold">{budget.amount === 0 ? "Not set" : formatAmount(budget.amount, budget.currency)}</span>
          </div>
          {budget.amount > 0 && (
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs text-text2">Remaining</span>
              <span className={`textBaseApp font-semibold ${remaining >= 0 ? "text-textGreen" : "text-textRed"}`}>{formatAmount(remaining, budget.currency)}</span>
            </div>
          )}
          <button
            onClick={openEditor}
            className="h-9 desktop:h-7 px-3 flex items-center gap-1.5 rounded-lg border border-borderFaint desktop:hover:bg-buttonTransBgHover active:bg-buttonTransBgHover cursor-pointer transition-colors text-text2 text-xs shrink-0"
          >
            <FiEdit2 className="text-xs" />
            <span>{budget.amount === 0 ? "Set budget" : "Edit"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
