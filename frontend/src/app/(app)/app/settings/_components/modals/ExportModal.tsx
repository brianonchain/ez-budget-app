"use client";
import { useState } from "react";
import Modal from "@/utils/components/Modal";
import Button from "@/utils/components/Button";
import { fetchGet } from "@/utils/functions";
import { SYMBOLS, DECIMALS } from "@/utils/constants";
import Calendar from "@/utils/components/Calendar";
import SelectDateButton from "@/utils/components/SelectDateButton";
import ErrorMessage from "@/utils/components/ErrorMessage";

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ExportModal({
  workspaceId,
  setExportModal,
}: {
  workspaceId: string;
  setExportModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeField, setActiveField] = useState<"start" | "end" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function onSelectDate(selected: Date | undefined) {
    console.log("selected", selected);
    if (!selected) return;
    if (activeField === "start") {
      setStartDate(selected);
      if (endDate && selected > endDate) setEndDate(undefined);
    } else {
      setEndDate(selected);
      if (startDate && selected < startDate) setStartDate(undefined);
    }
    setActiveField(null);
  }

  async function onExport() {
    if (!startDate || !endDate) {
      setError("Please select a start and end date.");
      return;
    }

    const start = toDateString(startDate);
    const end = toDateString(endDate);

    setError("");
    setIsLoading(true);
    try {
      const resJson = await fetchGet(`/api/exportItems?workspaceId=${workspaceId}&startDate=${start}&endDate=${end}`);
      if (resJson.status !== "success") throw new Error(resJson.message || "Export failed.");

      const items: {
        date: string;
        cost: number;
        currency: string;
        description: string;
        category: string;
        subcategory: string;
        tag: string;
      }[] = resJson.data.items;

      if (items.length === 0) {
        setError("No items found in this date range.");
        setIsLoading(false);
        return;
      }

      const headers = ["Date", "Description", "Cost", "Currency", "Category", "Subcategory", "Tag"];
      const rows = items.map((item) => [
        new Date(item.date).toISOString().slice(0, 10),
        csvEscape(item.description),
        (SYMBOLS[item.currency] ?? "") + item.cost.toFixed(DECIMALS[item.currency] ?? 2),
        item.currency,
        item.category,
        item.subcategory,
        item.tag,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_${start}_to_${end}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setExportModal(false);
    } catch (e: any) {
      setError(e.message || "Export failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal title="Export Items" setModal={setExportModal} disableCloseButton={isLoading}>
      <div className="flex flex-col items-center">
        {/* --- dates --- */}
        <div className="relative w-full grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="labelSm" id="label-start">
            Start Date
          </div>
          <div className="labelSm" id="label-end">
            End Date
          </div>
          <SelectDateButton
            isElevated={activeField === "start"}
            onClick={() => setActiveField("start")}
            aria-labelledby="label-start"
            date={startDate}
          />
          <SelectDateButton
            isElevated={activeField === "end"}
            onClick={() => setActiveField("end")}
            aria-labelledby="label-end"
            date={startDate}
          />
          {/* --- calendar --- */}
          {activeField && (
            <Calendar
              position="center"
              selected={activeField === "start" ? startDate : endDate}
              onSelect={onSelectDate}
              onClose={() => setActiveField(null)}
            />
          )}
        </div>
        <ErrorMessage message={error} />
        <Button
          className="mt-16 desktop:mt-36 w-full"
          label="Export"
          variant="primary"
          size="base"
          type="button"
          onClick={onExport}
          isLoading={isLoading}
          disabled={!startDate || !endDate}
        />
      </div>
    </Modal>
  );
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
