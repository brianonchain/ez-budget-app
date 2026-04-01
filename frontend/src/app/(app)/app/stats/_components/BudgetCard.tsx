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
        size="icon"
        icon={<FiEdit2 className="text-sm desktop:text-xs linkGrayColor" />}
        onClick={() => setBudgetModal(true)}
        aria-label="Edit discretionary budget"
      ></Button>
      {/* 0 is falsy so need != null, which checks for null and undefined */}
      {discretionaryBudget && monthlySpent != null ? (
        <>
          <div className="mt-3 textXl font-semibold">
            {formatAmount(discretionaryBudget.amount - monthlySpent, discretionaryBudget.currency)}
          </div>
          <div className="mt-1 textXs text-textSecondary">
            remaining from {formatAmount(discretionaryBudget.amount, discretionaryBudget.currency)}
          </div>
        </>
      ) : (
        <>
          <TextSkeleton className="mt-3 textXl font-semibold w-40" />
          <TextSkeleton className="mt-1 textXs w-40" />
        </>
      )}
    </>
  );
}
