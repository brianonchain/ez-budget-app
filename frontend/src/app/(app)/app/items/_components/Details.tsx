import { useState, useMemo } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { useItemsMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
import Button from "@/utils/components/Button";
import { CategoryObject } from "@/db/WorkspaceModel";
import DetailsCalendar from "./DetailsCalendar";
import { CURRENCIES, DECIMALS } from "@/utils/constants";
import { DraftItem, SettingsData } from "@/utils/types";

export default function Details({
  settingsData,
  draftItem,
  setDraftItem,
  setDetailsModal,
}: {
  settingsData: SettingsData;
  draftItem: DraftItem;
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
  setDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const isEdit = Boolean(draftItem._id);
  // store selected category object in memo
  const selectedCategoryObject = useMemo(() => {
    return (
      settingsData.workspace.categoryObjects.find((i: CategoryObject) => i.category === draftItem.category) ??
      settingsData.workspace.categoryObjects[0]
    );
  }, [settingsData.workspace.categoryObjects, draftItem.category]);

  // states
  const { mutateAsync: mutateItemsAsync, isPending, isError, error } = useItemsMutation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [costString, setCostString] = useState(draftItem.cost ? draftItem.cost.toString() : "");
  const [currency, setCurrency] = useState(draftItem.currency ?? "USD");
  const [status, setStatus] = useState<"initial" | "addingOrEditing" | "deleting">("initial"); // need status because we have 2 buttons; tanstack query isPending not enough
  const [validationError, setValidationError] = useState("");

  const decimals = DECIMALS[currency];

  async function onUpsert() {
    if (!Number.isFinite(draftItem.cost) || draftItem.cost <= 0) {
      setValidationError("Please enter a cost");
      return;
    }
    if (!draftItem.description.trim()) {
      setValidationError("Please enter an item description");
      return;
    }

    setStatus("addingOrEditing");
    try {
      await mutateItemsAsync({ type: "upsert", workspaceId: settingsData.workspace._id, item: draftItem });
      setDetailsModal(false);
    } catch {
      setStatus("initial");
    }
  }

  async function onDelete() {
    if (!draftItem._id) return;
    setStatus("deleting");
    try {
      await mutateItemsAsync({ type: "delete", workspaceId: settingsData.workspace._id, itemId: String(draftItem._id) });
      setDetailsModal(false);
    } catch {
      setStatus("initial");
    }
  }

  return (
    <Modal title="Item Info" setIsOpen={setDetailsModal}>
      <div className="flex-1 mx-auto w-full h-full max-w-100 flex flex-col items-center">
        {/*--- date, name, cost ---*/}
        <div className="w-full grid grid-cols-[auto_1fr] gap-y-1 gap-x-2 items-center">
          <label className="detailsLabel" htmlFor="details-date">
            Date
          </label>
          <div className="relative z-[200]">
            <button
              id="details-date"
              className="relative z-[1] w-full detailsInput flex items-center cursor-pointer"
              onClick={() => setShowCalendar(true)}
            >
              {new Date(draftItem.date).toLocaleString("en-US")}
            </button>
            {showCalendar && <DetailsCalendar setShowCalendar={setShowCalendar} draftItem={draftItem} setDraftItem={setDraftItem} />}
          </div>
          <label className="detailsLabel" htmlFor="details-desc">
            Item
          </label>
          <input
            id="details-desc"
            className="w-full detailsInput"
            value={draftItem.description}
            onChange={(e) => setDraftItem((prev) => ({ ...prev, description: e.currentTarget.value }))}
          />
          <label className="detailsLabel" htmlFor="details-cost">
            Cost
          </label>
          <div className="flex items-center gap-x-1">
            <input
              id="details-cost"
              className="detailsInput w-25 desktop:w-22"
              value={costString}
              onChange={(e) => {
                const val = e.currentTarget.value;
                if (!/^\d*\.?\d*$/.test(val)) return; // Only digits and optional dot
                if (decimals === 0 && val.includes(".")) return; // Block decimals if currency has 0
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
                  setDraftItem((prev) => ({ ...prev, cost: 0 }));
                  return;
                }
                // Pad decimals visually
                if (decimals > 0) {
                  normalized = n.toFixed(decimals);
                } else {
                  normalized = Math.trunc(n).toString();
                }
                setCostString(normalized);
                setDraftItem((prev) => ({ ...prev, cost: n }));
              }}
              inputMode="decimal"
            />
            <div className="relative">
              <select
                className="detailsInput appearance-none w-20 desktop:w-16"
                value={currency}
                onChange={(e) => {
                  const next = e.currentTarget.value;
                  setCurrency(next);
                  // Optional: normalize immediately when switching
                  setCostString("");
                  setDraftItem((prev) => ({ ...prev, currency: next }));
                }}
              >
                {CURRENCIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-[0.6rem] top-1/2 -translate-y-1/2 pointer-events-none text-sm desktop:text-[0.625rem] opacity-80" />
            </div>
          </div>
        </div>

        {/*--- label options ---*/}
        <div className="mt-6 w-full min-h-50 max-h-100 desktop:min-h-40 desktop:max-h-90 flex gap-1.5">
          {/*--- Category ---*/}
          <div className="flex-1 flex flex-col">
            <p className="text-center detailsLabel">Category</p>
            <div className="detailsOptionContainer overflow-y-auto thinScrollbar">
              {settingsData.workspace.categoryObjects.map((i: CategoryObject) => (
                <div
                  key={i.category}
                  className={`detailsOption ${draftItem.category === i.category ? "!bg-button1Bg text-button1Text" : ""} `}
                  onClick={() => setDraftItem((prev) => ({ ...prev, category: i.category, subcategory: "none" }))}
                >
                  {i.category}
                </div>
              ))}
            </div>
          </div>
          {/*--- Subcategory ---*/}
          <div className="flex-1 flex flex-col">
            <p className="text-center detailsLabel">Subcategory</p>
            <div className="detailsOptionContainer overflow-y-auto thinScrollbar">
              {selectedCategoryObject.subcategories.map((i: string) => (
                <div
                  key={i}
                  className={`detailsOption ${i === draftItem.subcategory ? "!bg-button1Bg text-button1Text" : ""} `}
                  onClick={() => setDraftItem((prev) => ({ ...prev, subcategory: i }))}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>
          {/*--- Tags ---*/}
          <div className="flex-1 flex flex-col">
            <p className="text-center detailsLabel">Tags</p>
            <div className="detailsOptionContainer overflow-y-auto thinScrollbar">
              {settingsData.workspace.tags.map((i: string) => (
                <div
                  key={i}
                  className={`detailsOption ${draftItem.tag === i ? "!bg-button1Bg text-button1Text" : ""} `}
                  onClick={() => {
                    console.log("click");
                    setDraftItem((prev) => ({ ...prev, tag: i }));
                  }}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*--- save changes button ---*/}
        <Button
          className="mt-6"
          label={draftItem._id ? "Save Changes" : "Add Item"}
          onClick={onUpsert}
          isLoading={status === "addingOrEditing"}
          disabled={status !== "initial" || isPending}
          type="button"
        />
        {/*--- validation error message ---*/}
        <div className="shrink-0 errorText h-24 desktop:h-16 flex items-center justify-center">
          {validationError ? validationError : isError ? error?.message : ""}
        </div>
        {/*--- (optiona) delete button ---*/}
        {draftItem._id && (
          <Button
            className="mt-auto mx-auto buttonRed"
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
    </Modal>
  );
}
