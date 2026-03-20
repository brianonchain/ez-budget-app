"use client";
import { useState } from "react";
import { DiscretionaryBudget } from "@/utils/types";
import { SYMBOLS, DECIMALS } from "@/utils/constants";
import { FiEdit2 } from "react-icons/fi";
import Card from "@/utils/components/Card";
import Button from "@/utils/components/Button";
import Skeleton from "@/utils/components/Skeleton";

function formatAmount(amount: number, currency: string) {
  const sym = SYMBOLS[currency] ?? "";
  const dec = DECIMALS[currency] ?? 2;
  return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
}

export default function BudgetCard({
  discretionaryBudget,
  monthlySpent,
  setBudgetModal,
}: {
  discretionaryBudget: DiscretionaryBudget | undefined | null;
  monthlySpent: number | undefined | null;
  setBudgetModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Card className="relative flex flex-col items-center">
      <div className="font-semibold text-textSecondary">Discretionary Budget</div>
      <Button
        className="absolute right-2 top-2 desktop:top-3 desktop:right-3"
        variant="outline"
        size="statsIcon"
        icon={<FiEdit2 className="text-sm" />}
        onClick={() => setBudgetModal(true)}
      ></Button>

      {discretionaryBudget && monthlySpent ? (
        <>
          <div className="mt-2 text2xl font-semibold">
            {formatAmount(discretionaryBudget.amount - monthlySpent, discretionaryBudget.currency)}
          </div>
          <div className="mt-2 desktop:mt-1 textSm text-textTertiary">
            remaining from {formatAmount(discretionaryBudget.amount, discretionaryBudget.currency)}
          </div>
        </>
      ) : (
        <>
          <Skeleton className="mt-2 text2xl w-40" />
          <Skeleton className="mt-2 desktop:mt-1 textSm w-40" />
        </>
      )}
    </Card>
  );
}
