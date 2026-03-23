"use client";
import { DiscretionaryBudget } from "@/utils/types";
import { SYMBOLS, DECIMALS } from "@/utils/constants";
import { FiEdit2 } from "react-icons/fi";
import Button from "@/utils/components/Button";
import TextSkeleton from "@/utils/components/TextSkeleton";

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
    <>
      <Button
        className="absolute right-2 top-2 xs:top-3 xs:right-3"
        variant="outline"
        size="statsIcon"
        icon={<FiEdit2 className="text-sm desktop:text-xs" />}
        onClick={() => setBudgetModal(true)}
      ></Button>
      {discretionaryBudget && monthlySpent ? (
        <>
          <div className="mt-3 text2xl font-semibold">
            {formatAmount(discretionaryBudget.amount - monthlySpent, discretionaryBudget.currency)}
          </div>
          <div className="mt-1 textSm text-textSecondary">
            remaining from {formatAmount(discretionaryBudget.amount, discretionaryBudget.currency)}
          </div>
        </>
      ) : (
        <>
          <TextSkeleton className="mt-3 text2xl font-semibold w-40" />
          <TextSkeleton className="mt-1 textSm w-40" />
        </>
      )}
    </>
  );
}
