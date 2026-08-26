import { useState, useMemo, useEffect } from "react";
import { useItemsMutation } from "@/utils/hooks";
import { AnimatePresence } from "framer-motion";
// components
import DeleteModal from "@/utils/components/simpleModal/InnerDeleteModal";
import Button from "@/utils/components/Button";
import Input from "@/utils/components/Input";
import Select from "@/utils/components/Select";
import Calendar from "@/utils/components/Calendar";
import ErrorMessage from "@/utils/components/ErrorMessage";
import DetailsList from "./DetailsList";
// types and constants
import { CategoryObject } from "@/db/WorkspaceModel";
import { CURRENCIES, DECIMALS } from "@/utils/constants";
import type { DraftItem, WorkspaceData, Direction } from "@/utils/types";
import { useInnerBackdrop } from "@/utils/components/modal/Modal";

export default function DetailsPage({
  workspaceData,
  draftItem,
  setDraftItem,
  onClose,
}: {
  workspaceData: WorkspaceData;
  draftItem: DraftItem;
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
  onClose: () => void;
}) {
  // hooks
  const setInnerBackdrop = useInnerBackdrop();

  // store selected category object in memo
  const selectedCategoryObject = useMemo(() => {
    return (
      workspaceData.workspace.categoryObjects.find((i: CategoryObject) => i.category === draftItem.category) ??
      workspaceData.workspace.categoryObjects[0]
    );
  }, [workspaceData.workspace.categoryObjects, draftItem.category]);

  // states
  const { mutateAsync: mutateItemsAsync, isPending, isError, error, reset: resetItemsMutation } = useItemsMutation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [costString, setCostString] = useState(draftItem.cost ? draftItem.cost.toString() : "");
  const [description, setDescription] = useState(draftItem.description);
  const [currency, setCurrency] = useState(draftItem.currency ?? "USD");
  const [status, setStatus] = useState<"initial" | "addingOrEditing" | "deleting">("initial"); // need status because we have 2 buttons; tanstack query isPending not enough
  const [validationError, setValidationError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const decimals = DECIMALS[currency];

  useEffect(() => {
    setInnerBackdrop(showDeleteModal);
    return () => setInnerBackdrop(false);
  }, [showDeleteModal, showCalendar, setInnerBackdrop]);

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

    setValidationError("");
    resetItemsMutation(); // resets error/isError state
    setStatus("addingOrEditing");

    try {
      await mutateItemsAsync({ type: "upsert", workspaceId: workspaceData.workspace._id, item: draftItem });
      localStorage.setItem("ezb:lastTag", draftItem.tag);
      onClose();
    } catch {
      setStatus("initial");
    }
  }

  async function onDelete() {
    if (!draftItem._id) return;

    setValidationError("");
    resetItemsMutation(); // resets error/isError state
    setStatus("deleting");

    try {
      await mutateItemsAsync({ type: "delete", workspaceId: workspaceData.workspace._id, itemId: String(draftItem._id) });
      onClose();
    } catch {
      setStatus("initial");
      setShowDeleteModal(false);
    }
  }

  return (
    <div className="w-full flex flex-col">
      {/*--- date, name, cost ---*/}
      <div className="w-full grid grid-cols-[2.75rem_1fr] desktop:grid-cols-[2.1rem_1fr] gap-1.5 items-center">
        <div className="col-span-2 relative w-full grid grid-cols-[2.75rem_1fr] desktop:grid-cols-[2.1rem_1fr] gap-1.5 items-center">
          <label className="detailsLabel" htmlFor="details-date">
            Date
          </label>
          <div className={showDeleteModal ? "" : "z-30"}>
            <Button
              className="w-full"
              label={new Date(draftItem.date).toLocaleString("en-US", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
              variant="input"
              size="xs"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setShowCalendar((open) => !open)}
            />
          </div>
          <AnimatePresence>
            {showCalendar && (
              <Calendar
                className="row-start-1 col-span-2"
                position="right"
                onClose={() => setShowCalendar(false)}
                selected={new Date(draftItem?.date)}
                onSelect={(selected) => {
                  if (!selected) return;
                  setDraftItem((prev) => ({ ...prev, date: selected.toISOString() }));
                }}
              />
            )}
          </AnimatePresence>
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
          items={workspaceData.workspace.categoryObjects}
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
          items={workspaceData.workspace.tags}
          selectedItem={draftItem.tag}
          onClick={(i) => setDraftItem((prev) => ({ ...prev, tag: i }))}
        />
      </div>

      {/*--- save/add button ---*/}
      {["owner", "editor"].includes(workspaceData.role) && (
        <Button
          className="mt-6 w-full"
          label={draftItem._id ? "Save Changes" : "Add Item"}
          variant="primary"
          size="base"
          onClick={onUpsert}
          isLoading={status === "addingOrEditing"}
          disabled={status !== "initial" || isPending}
        />
      )}
      {/*--- error message ---*/}
      <ErrorMessage message={validationError ? validationError : isError ? error?.message : ""} />

      {/*--- delete button ---*/}
      {draftItem._id && ["owner", "editor"].includes(workspaceData.role) && (
        <Button
          className="w-full"
          label="Delete Item"
          variant="dangerOutline2"
          size="base"
          onClick={() => setShowDeleteModal(true)}
          isLoading={status === "deleting"}
          disabled={status !== "initial" || isPending}
        />
      )}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            message="Delete this item?"
            onClose={() => setShowDeleteModal(false)}
            onDelete={onDelete}
            disabled={status !== "initial" || isPending}
            isLoading={status === "deleting"}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
