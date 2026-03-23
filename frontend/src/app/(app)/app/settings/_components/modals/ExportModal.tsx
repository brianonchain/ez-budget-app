"use client";
import { useState } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import Modal from "@/utils/components/Modal";
import Button from "@/utils/components/Button";
import { fetchGet } from "@/utils/functions";
import { SYMBOLS, DECIMALS } from "@/utils/constants";

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const FORMAT_OPTS: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

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

  const defaultClassNames = getDefaultClassNames();

  function onSelectDate(selected: Date | undefined) {
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
        {/* faux date inputs */}
        <div className="relative z-[200] w-full flex flex-col gap-1">
          <div className="flex gap-2">
            <label className="flex-1 textSm font-medium text-textSecondary">Start Date</label>
            <label className="flex-1 textSm font-medium text-textSecondary">End Date</label>
          </div>
          <div className="flex gap-2">
            <button
              className={`relative z-[1] flex-1 min-w-0 inputOutlineColor h-12 desktop:h-9 px-3 desktop:px-2.5 textBase rounded-lg text-left cursor-pointer truncate ${
                activeField === "start" ? "ring-2 ring-buttonPrimaryBg" : ""
              }`}
              onClick={() => setActiveField("start")}
            >
              {startDate ? startDate.toLocaleDateString("en-US", FORMAT_OPTS) : "Select date"}
            </button>
            <button
              className={`relative z-[1] flex-1 min-w-0 inputOutlineColor h-12 desktop:h-9 px-3 desktop:px-2.5 textBase rounded-lg text-left cursor-pointer truncate ${
                activeField === "end" ? "ring-2 ring-buttonPrimaryBg" : ""
              }`}
              onClick={() => setActiveField("end")}
            >
              {endDate ? endDate.toLocaleDateString("en-US", FORMAT_OPTS) : "Select date"}
            </button>
          </div>
          {/* absolutely positioned calendar */}
          {activeField && (
            <>
              <div className="z-10 fixed inset-0 bg-black/30" onClick={() => setActiveField(null)} />
              <div className="z-20 absolute left-1/2 -translate-x-1/2 top-[calc(100%+0.25rem)] px-2 py-2 desktop:py-1 rounded-lg bg-inputPrimaryBg border border-inputPrimaryBorderFocus">
                <DayPicker
                  className="myCalendar"
                  classNames={{
                    // month and nav buttons
                    month_caption: `${defaultClassNames.month_caption}`,
                    caption_label: `${defaultClassNames.caption_label} textXl font-semibold`,
                    nav: `${defaultClassNames.nav}`,
                    button_previous: `${defaultClassNames.button_previous}`,
                    button_next: `${defaultClassNames.button_next}`,
                    chevron: `${defaultClassNames.chevron} w-7 h-7 desktop:w-5 desktop:h-5 !fill-textPrimary desktop:hover:!fill-textSecondary`,
                    // day of week label
                    weekday: `${defaultClassNames.weekday} !textBase !font-medium`,
                    // days
                    day: `${defaultClassNames.day}`,
                    day_button: `${defaultClassNames.day_button} !font-medium [&:not(.rdp-selected):hover]:!bg-surface2Solid [transition:background-color_0.3s_ease] select-none`,
                    // selected
                    selected: `${defaultClassNames.selected} !font-medium !textBase bg-buttonPrimaryBg text-buttonPrimaryText rounded-lg`,
                    // today: `${defaultClassNames.today} [&:not(.rdp-selected)]:bg-transparent dark:[&:not(.rdp-selected)]:bg-transparent`,
                  }}
                  navLayout="around"
                  mode="single"
                  endMonth={new Date()}
                  selected={activeField === "start" ? startDate : endDate}
                  onSelect={onSelectDate}
                  disabled={{ after: new Date() }}
                />
              </div>
            </>
          )}
        </div>

        {error && <p className="mt-6 textSm text-textError text-center">{error}</p>}
        <Button
          label="Export"
          variant="primary"
          size="base"
          type="button"
          onClick={onExport}
          isLoading={isLoading}
          disabled={!startDate || !endDate}
          className="mt-50 w-full"
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
