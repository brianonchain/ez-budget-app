import { useState, useMemo } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { useItemsMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
import Button from "@/utils/components/Button";
import { CategoryObject } from "@/db/WorkspaceModel";
import DetailsCalendar from "./DetailsCalendar";
import { CURRENCIES, DECIMALS } from "@/utils/constants";
import { DraftItem, SettingsData } from "@/utils/types";
import Input from "@/utils/components/Input";
import Select from "@/utils/components/Select";

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
  const [description, setDescription] = useState(draftItem.description);
  const [currency, setCurrency] = useState(draftItem.currency ?? "USD");
  const [status, setStatus] = useState<"initial" | "addingOrEditing" | "deleting">("initial"); // need status because we have 2 buttons; tanstack query isPending not enough
  const [validationError, setValidationError] = useState("");

  const decimals = DECIMALS[currency];

  function onChangeCostString(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.currentTarget.value;
    if (!/^\d*\.?\d*$/.test(val)) return; // Only digits and optional dot
    if (decimals === 0 && val.includes(".")) return; // Block decimals if currency has 0
    // Enforce max fraction digits
    if (val.includes(".")) {
      const [, frac = ""] = val.split(".");
      if (frac.length > decimals) return;
    }
    setCostString(val);
  }

  function onBlurCostString() {
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
  }

  function onChangeCurrency(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.currentTarget.value;
    setCurrency(next);
    // Optional: normalize immediately when switching
    setCostString("");
    setDraftItem((prev) => ({ ...prev, currency: next }));
  }

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
    <Modal title="Item Info" setModal={setDetailsModal}>
      <div className="flex-1 mx-auto w-full h-full max-w-100 flex flex-col items-center">
        {/*--- date, name, cost ---*/}
        <div className="mt-1 w-full grid grid-cols-[auto_1fr] gap-y-1 gap-x-2 items-center">
          <label className="detailsLabel" htmlFor="details-date">
            Date
          </label>
          <div className="relative z-[200]">
            <button
              id="details-date"
              className="relative z-20 w-full detailsInput flex items-center cursor-pointer"
              onClick={() => setShowCalendar(true)}
            >
              {new Date(draftItem.date).toLocaleString("en-US")}
            </button>
            {showCalendar && <DetailsCalendar setShowCalendar={setShowCalendar} draftItem={draftItem} setDraftItem={setDraftItem} />}
          </div>
          <label className="detailsLabel" htmlFor="details-desc">
            Item
          </label>
          <Input
            className="w-full"
            inputSize="xs"
            variant="primary"
            id="details-desc"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            onBlur={(e) => setDraftItem((prev) => ({ ...prev, description }))}
          />
          <label className="detailsLabel" htmlFor="details-cost">
            Cost
          </label>
          <div className="flex items-center gap-1">
            <Input
              id="details-cost"
              className="w-25 desktop:w-22"
              inputSize="xs"
              variant="primary"
              value={costString}
              onChange={onChangeCostString}
              onBlur={onBlurCostString}
              inputMode="decimal"
            />
            <Select variant="primary" selectSize="xs" value={currency} onChange={onChangeCurrency}>
              {CURRENCIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
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
                  className={`detailsOption ${draftItem.category === i.category ? "!bg-buttonPrimaryBg text-buttonPrimaryText" : ""} `}
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
                  className={`detailsOption ${i === draftItem.subcategory ? "!bg-buttonPrimaryBg text-buttonPrimaryText" : ""} `}
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
                  className={`detailsOption ${draftItem.tag === i ? "!bg-buttonPrimaryBg text-buttonPrimaryText" : ""} `}
                  onClick={() => {
                    setDraftItem((prev) => ({ ...prev, tag: i }));
                    localStorage.setItem(`lastTag:${settingsData.workspace._id}`, i);
                  }}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*--- save changes button ---*/}
        {["owner", "editor"].includes(settingsData.role) && (
          <Button
            className="mt-6 w-full"
            label={draftItem._id ? "Save Changes" : "Add Item"}
            variant="primary"
            size="base"
            onClick={onUpsert}
            isLoading={status === "addingOrEditing"}
            disabled={status !== "initial" || isPending}
            type="button"
          />
        )}
        {/*--- validation error message ---*/}
        <div className="shrink-0 errorText h-24 desktop:h-16 flex items-center justify-center">
          {validationError ? validationError : isError ? error?.message : ""}
        </div>
        {/*--- (optiona) delete button ---*/}
        {draftItem._id && ["owner", "editor"].includes(settingsData.role) && (
          <Button
            className="w-full"
            label="Delete Item"
            variant="danger"
            size="base"
            onClick={onDelete}
            isLoading={status === "deleting"}
            disabled={status !== "initial" || isPending}
            type="button"
          />
        )}
      </div>
    </Modal>
  );
}
