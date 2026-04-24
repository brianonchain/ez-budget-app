import { useState, useEffect, useCallback } from "react";
import { useWorkspaceMutation } from "@/utils/hooks";
import Modal from "@/utils/components/modal/Modal";
import { DiscretionaryBudget } from "@/utils/types";
import { CategoryObject } from "@/db/WorkspaceModel";
import Input from "@/utils/components/Input";
import Select from "@/utils/components/Select";
import { CURRENCIES } from "@/utils/constants";
import ErrorMessage from "@/utils/components/ErrorMessage";

export default function BudgetModal({
  workspaceId,
  discretionaryBudget,
  categoryObjects,
  setBudgetModal,
}: {
  workspaceId: string;
  discretionaryBudget: DiscretionaryBudget;
  categoryObjects: CategoryObject[];
  setBudgetModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [draftAmount, setDraftAmount] = useState(String(discretionaryBudget?.amount ?? 0));
  const [draftCurrency, setDraftCurrency] = useState(discretionaryBudget?.currency ?? "USD");
  const [validationError, setValidationError] = useState("");
  const [draftBudgetCategoryObjects, setDraftBudgetCategoryObjects] = useState<CategoryObject[]>(discretionaryBudget.categoryObjects ?? []);
  const { mutateAsync, error, isError, isPending } = useWorkspaceMutation();

  // update UI state with server state; but will not fire on mutation fire, so need rollback in update
  useEffect(() => {
    setDraftBudgetCategoryObjects(discretionaryBudget.categoryObjects ?? []);
  }, [discretionaryBudget.categoryObjects]);

  async function onBlurAmount() {
    const amount = Number(draftAmount);
    if (amount === discretionaryBudget.amount && draftCurrency === discretionaryBudget.currency) return;
    if (isNaN(amount) || amount < 0) return;
    mutateAsync({ type: "setDiscretionaryBudget", workspaceId, amount, currency: draftCurrency });
  }

  function isCategoryChecked(category: string): boolean {
    return draftBudgetCategoryObjects.some((c) => c.category === category);
  }

  function isSubChecked(category: string, sub: string): boolean {
    const entry = draftBudgetCategoryObjects.find((c) => c.category === category);
    if (!entry) return false;
    return entry.subcategories[0] === "all" || entry.subcategories.includes(sub);
  }

  function toggleCategory(category: string) {
    const isChecked = isCategoryChecked(category);
    if (isChecked) {
      update(draftBudgetCategoryObjects.filter((c) => c.category !== category));
    } else {
      update([...draftBudgetCategoryObjects, { category, subcategories: ["all"] }]);
    }
  }

  function toggleSub(category: string, sub: string, allSubs: string[]) {
    // exists
    const entry = draftBudgetCategoryObjects.find((c) => c.category === category);
    // 1) if !entry, create empty subcategory array 2) if "all", replace with all subcategories
    const currentSubs = !entry ? [] : entry.subcategories[0] === "all" ? allSubs : entry.subcategories;
    // add or remove sub from list
    const nextSubs = currentSubs.includes(sub) ? currentSubs.filter((s) => s !== sub) : [...currentSubs, sub];
    // uncheck category if all subcategories become unchecked
    if (nextSubs.length === 0) {
      update(draftBudgetCategoryObjects.filter((c) => c.category !== category)); // if no subcategories
      return;
    }
    // if all subcategories, replace with "all"
    const normalizedSubs = nextSubs.length === allSubs.length ? ["all"] : nextSubs;
    update(draftBudgetCategoryObjects.map((c) => (c.category === category ? { ...c, subcategories: normalizedSubs } : c)));
  }

  async function update(next: CategoryObject[]) {
    const rollback = draftBudgetCategoryObjects;
    setDraftBudgetCategoryObjects(next);
    try {
      await mutateAsync({ type: "setDiscretionaryBudgetCategories", workspaceId, categoryObjects: next });
    } catch {
      setDraftBudgetCategoryObjects(rollback);
    }
  }

  return (
    <Modal title="Discretionary Budget" onClose={() => setBudgetModal(false)} disableClose={isPending}>
      <div className="w-full">
        {/* --- amount --- */}
        <div className="flex items-center gap-3 desktop:gap-4">
          <label className="shrink-0 font-medium">Monthly Amount</label>
          <Select
            variant="primary"
            selectSize="base"
            value={draftCurrency}
            onChange={(e) => {
              setDraftCurrency(e.target.value);
            }}
          >
            {CURRENCIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
          <Input
            className="w-full"
            inputSize="base"
            variant="primary"
            value={draftAmount}
            onChange={(e) => {
              setDraftAmount(e.target.value);
              if (validationError) setValidationError("");
            }}
            onBlur={onBlurAmount}
          />
        </div>
        {/*--- validation error ---*/}
        <ErrorMessage message={validationError ? validationError : isError ? error?.message : ""} />

        {/*--- category checkboxes ---*/}
        <div className="pt-6 desktop:pt-4 font-medium border-t border-borderFaint">
          Which categories are part of your discretionary budget?
        </div>
        <div className="mt-6 grid grid-cols-2 gap-8">
          {categoryObjects.map((catObj) => {
            return (
              <div key={catObj.category} className="min-w-0">
                {/* ---- category ---- */}
                <CheckboxRow
                  label={catObj.category === "none" ? '"none"' : catObj.category}
                  checked={isCategoryChecked(catObj.category)}
                  disabled={isPending}
                  onChange={() => toggleCategory(catObj.category)}
                  labelClassName="truncate font-medium"
                />
                {/* ---- subcategories ---- */}
                <div className="ml-6 mt-4 flex flex-col gap-4">
                  {catObj.subcategories.map((sub) => (
                    <CheckboxRow
                      key={sub}
                      label={sub === "none" ? '"none"' : sub}
                      checked={isSubChecked(catObj.category, sub)}
                      disabled={isPending}
                      onChange={() => toggleSub(catObj.category, sub, catObj.subcategories)}
                      labelClassName="textXs truncate"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

function CheckboxRow({
  label,
  checked,
  disabled,
  onChange,
  labelClassName,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  labelClassName: string;
}) {
  return (
    <label className={`flex items-center gap-2 min-w-0 cursor-pointer ${disabled ? "pointer-events-none" : ""}`}>
      <input
        type="checkbox"
        className="w-6 h-6 desktop:w-5 desktop:h-5 shrink-0 accent-buttonPrimaryBg"
        checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onChange={disabled ? () => {} : onChange}
      />
      <span className={labelClassName}>{label}</span>
    </label>
  );
}
