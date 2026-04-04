import { useState, useMemo } from "react";
import { useItemsMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
import Button from "@/utils/components/Button";
import { CategoryObject } from "@/db/WorkspaceModel";
import { CURRENCIES, DECIMALS } from "@/utils/constants";
import { DraftItem, SettingsData } from "@/utils/types";
import Input from "@/utils/components/Input";
import Select from "@/utils/components/Select";
import Calendar from "@/utils/components/Calendar";
import ErrorMessage from "@/utils/components/ErrorMessage";
import DetailsList from "./DetailsList";

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
      <div className="mt-1 w-full flex flex-col">
        {/*--- date, name, cost ---*/}
        <div className="w-full grid grid-cols-[auto_1fr] gap-1.5 items-center">
          <label className="detailsLabel" htmlFor="details-date">
            Date
          </label>
          <div className="relative">
            <Button
              className="relative z-20 w-full"
              label={new Date(draftItem.date).toLocaleString("en-US")}
              variant="input"
              size="xs"
              type="button"
              onClick={() => setShowCalendar(true)}
            />
            {showCalendar && (
              <Calendar
                position="right"
                onClose={() => setShowCalendar(false)}
                selected={new Date(draftItem?.date)}
                onSelect={(selected) => {
                  if (!selected) return;
                  setDraftItem((prev) => ({ ...prev, date: selected.toISOString() }));
                  setShowCalendar(false);
                }}
              />
            )}
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
        <div className="textSm mt-6 w-full min-h-50 max-h-100 desktop:min-h-40 desktop:max-h-90 flex gap-1.5">
          <DetailsList
            label="Category"
            items={settingsData.workspace.categoryObjects}
            selectedItem={draftItem.category}
            onClick={(i) => setDraftItem((prev) => ({ ...prev, category: typeof i === "string" ? i : i.category, subcategory: "none" }))}
          />
          <DetailsList
            label="Subcategory"
            items={selectedCategoryObject.subcategories}
            selectedItem={draftItem.subcategory}
            onClick={(i) => setDraftItem((prev) => ({ ...prev, subcategory: i }))}
          />
          <DetailsList
            label="Tag"
            items={settingsData.workspace.tags}
            selectedItem={draftItem.tag}
            onClick={(i) => setDraftItem((prev) => ({ ...prev, tag: i }))}
          />
        </div>

        {/*--- save/add button ---*/}
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
        {/*--- error message ---*/}
        <ErrorMessage message={validationError ? validationError : isError ? error?.message : ""} />
        {/*--- delete button ---*/}
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
