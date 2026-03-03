import { useState, useMemo } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { Item } from "@/db/UserModel";
import { useItemsMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
import Button from "@/utils/components/Button";
import { CategoryObject } from "@/db/UserModel";
import DetailsCalendar from "./DetailsCalendar";
import { CURRENCIES, DECIMALS } from "@/utils/constants";
import { Currency } from "@/utils/types";

export default function Details({
  data,
  newItem,
  setNewItem,
  setDetailsModal,
}: {
  data: any;
  newItem: Item;
  setNewItem: React.Dispatch<React.SetStateAction<Item>>;
  setDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const isEdit = Boolean(newItem._id);
  // store selected category object in memo
  const selectedCategoryObject = useMemo(() => {
    return data.settings.categoryObjects.find((i: CategoryObject) => i.category === newItem.category) ?? data.settings.categoryObjects[0];
  }, [data.settings.categoryObjects, newItem.category]);

  // states
  const { mutateAsync: mutateItemsAsync, isPending, isError, error } = useItemsMutation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [costString, setCostString] = useState(newItem.cost ? newItem.cost.toString() : "");
  const [currency, setCurrency] = useState<Currency>((newItem.currency as Currency) ?? "USD");
  const [status, setStatus] = useState<"initial" | "addingOrEditing" | "deleting">("initial"); // need status because we have 2 buttons; tanstack query isPending not enough
  const [validationError, setValidationError] = useState("");

  const decimals = DECIMALS[currency];

  console.log(newItem);

  async function onUpsert() {
    if (!Number.isFinite(newItem.cost) || newItem.cost <= 0) {
      setValidationError("Please enter a cost");
      return;
    }
    if (!newItem.description.trim()) {
      setValidationError("Please enter an item description");
      return;
    }

    setStatus("addingOrEditing");
    try {
      await mutateItemsAsync({ type: "upsert", item: newItem });
      setDetailsModal(false);
    } catch {
      setStatus("initial");
    }
  }

  async function onDelete() {
    if (!newItem._id) return;
    setStatus("deleting");
    try {
      await mutateItemsAsync({ type: "delete", itemId: String(newItem._id) });
      setDetailsModal(false);
    } catch {
      setStatus("initial");
    }
  }

  return (
    <Modal title="Item Info" setIsOpen={setDetailsModal}>
      <div className="mx-auto w-full max-w-100 h-full desktop:h-[calc(90dvh-12px-48px-100px)] flex flex-col">
        {/*--- date, name, cost ---*/}
        <div className="shrink-0 w-full grid grid-cols-[auto_1fr] gap-y-[4px] gap-x-[12px] items-center">
          <label className="inputLabel" htmlFor="details-date">
            Date
          </label>
          <div className="relative z-[200]">
            <button
              id="details-date"
              className="relative z-[1] inputSmall flex items-center cursor-pointer"
              onClick={() => setShowCalendar(true)}
            >
              {new Date(newItem.date).toLocaleString("en-US")}
            </button>
            {showCalendar && <DetailsCalendar setShowCalendar={setShowCalendar} newItem={newItem} setNewItem={setNewItem} />}
          </div>

          <label className="inputLabel" htmlFor="details-desc">
            Item
          </label>
          <input
            id="details-desc"
            className="inputSmall"
            value={newItem.description}
            onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.currentTarget.value }))}
          />
          <label className="inputLabel" htmlFor="details-cost">
            Cost
          </label>
          <div className="flex items-center gap-x-[4px]">
            <input
              id="details-cost"
              className="inputSmall !w-[100px]"
              value={costString}
              onChange={(e) => {
                const val = e.currentTarget.value;
                // Only digits and optional dot
                if (!/^\d*\.?\d*$/.test(val)) return;
                // Block decimals if currency has 0
                if (decimals === 0 && val.includes(".")) return;
                // Enforce max fraction digits
                if (val.includes(".")) {
                  const [, frac = ""] = val.split(".");
                  if (frac.length > decimals) return;
                }
                setCostString(val);
              }}
              onBlur={() => {
                let normalized = costString;
                if (normalized.endsWith(".")) {
                  normalized = normalized.slice(0, -1);
                }
                const n = Number(normalized);
                if (!Number.isFinite(n)) {
                  setCostString("");
                  setNewItem((prev) => ({ ...prev, cost: 0 }));
                  return;
                }
                // Pad decimals visually
                if (decimals > 0) {
                  normalized = n.toFixed(decimals);
                } else {
                  normalized = Math.trunc(n).toString();
                }
                setCostString(normalized);
                setNewItem((prev) => ({ ...prev, cost: n }));
              }}
              inputMode="decimal"
            />
            <div className="relative">
              <select
                className="inputSmall !w-auto appearance-none !pr-[1.3rem]"
                value={currency}
                onChange={(e) => {
                  const next = e.currentTarget.value as Currency;
                  setCurrency(next);
                  // Optional: normalize immediately when switching
                  setCostString("");
                  setNewItem((prev) => ({ ...prev, currency: next }));
                }}
              >
                {CURRENCIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-[4px] desktop:right-[0.6rem] top-1/2 -translate-y-1/2 pointer-events-none text-[14px] desktop:text-[10px] opacity-80" />
            </div>
          </div>
        </div>

        {/*--- label options ---*/}
        <div className="flex-1 min-h-40 max-h-full overflow-hidden mt-[20px] w-full grid grid-cols-3 gap-[6px]">
          {/*--- Category ---*/}
          <div className="flex-1 min-h-0 flex flex-col">
            <p className="text-center inputLabel">Category</p>
            <div className="detailsLabelContainer overflow-y-auto thinScrollbar">
              {data.settings.categoryObjects.map((i: CategoryObject) => (
                <div
                  key={i.category}
                  className={`detailsLabel ${
                    newItem.category === i.category
                      ? "!bg-lightButton1Bg dark:!bg-darkButton1Bg text-lightButton1Text dark:text-darkButton1Text"
                      : ""
                  } `}
                  onClick={() => setNewItem((prev) => ({ ...prev, category: i.category, subcategory: "none" }))}
                >
                  {i.category}
                </div>
              ))}
            </div>
          </div>
          {/*--- Subcategory ---*/}
          <div className="flex-1 min-h-0 flex flex-col">
            <p className="text-center inputLabel">Subcategory</p>
            <div className="detailsLabelContainer overflow-y-auto thinScrollbar">
              {selectedCategoryObject.subcategories.map((i: string) => (
                <div
                  key={i}
                  className={`detailsLabel ${
                    i === newItem.subcategory
                      ? "!bg-lightButton1Bg dark:!bg-darkButton1Bg text-lightButton1Text dark:text-darkButton1Text"
                      : ""
                  } `}
                  onClick={() => setNewItem((prev) => ({ ...prev, subcategory: i }))}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>
          {/*--- Tags ---*/}
          <div className="flex-1 min-h-0 flex flex-col">
            <p className="text-center inputLabel">Tags</p>
            <div className="detailsLabelContainer overflow-y-auto thinScrollbar">
              {data.settings.tags.map((i: string) => (
                <div
                  key={i}
                  className={`detailsLabel ${
                    newItem.tags === i ? "!bg-lightButton1Bg dark:!bg-darkButton1Bg text-lightButton1Text dark:text-darkButton1Text" : ""
                  } `}
                  onClick={() => setNewItem((prev) => ({ ...prev, tags: i }))}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 pt-6">
          {/*--- save changes button ---*/}
          <Button
            label={newItem._id ? "Save Changes" : "Add Item"}
            onClick={onUpsert}
            isLoading={status === "addingOrEditing"}
            disabled={status !== "initial" || isPending}
            type="button"
          />
          {/*--- validation error message ---*/}
          <div className="errorText h-20 flex items-center justify-center">
            {validationError ? validationError : isError ? error?.message : ""}
          </div>
          {/*--- (optiona) delete button ---*/}
          {newItem._id && (
            <Button
              className="shrink-0 buttonRed"
              label="Delete Item"
              onClick={onDelete}
              isLoading={status === "deleting"}
              disabled={status !== "initial" || isPending}
              type="button"
            >
              {status === "deleting" ? "Deleting..." : "Delete Item"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
