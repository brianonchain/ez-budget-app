import { useState } from "react";
import { FaDeleteLeft, FaChevronDown } from "react-icons/fa6";
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/Modal";
import { useSettingsMutation } from "@/utils/hooks";
import { CURRENCIES, DECIMALS, MULTIPLIER } from "@/utils/constants";
import { DraftItem } from "@/utils/types";

const calc = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0"] as const;

export default function EnterCost({
  setCostModal,
  setNameModal,
  setDraftItem,
  defaultCurrency,
  workspaceId,
}: {
  setCostModal: React.Dispatch<React.SetStateAction<boolean>>;
  setNameModal: React.Dispatch<React.SetStateAction<boolean>>;
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
  defaultCurrency: string;
  workspaceId: string;
}) {
  // hooks
  const { mutateAsync: settingsMutateAsync, isPending, error: currencyError } = useSettingsMutation();
  // states
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  // constants
  const decimals = DECIMALS[currency];
  const multiplier = MULTIPLIER[currency];
  const maxFractionDigits = decimals + Math.log10(multiplier);

  function onClickNumber(key: string) {
    setAmount((prev) => {
      if (key === "." && maxFractionDigits === 0) return prev; // disabled prop should not allow this

      if (key === ".") {
        if (!prev) return "0.";
        if (prev.includes(".")) return prev;
        return prev + ".";
      }

      if (!prev) return key;
      if (prev.replace(".", "").length >= 9) return prev; // avoid crazy long strings

      // prevent leading zeros like "00"
      if (prev === "0" && key === "0" && !prev.includes(".")) return prev;
      if (prev === "0" && key !== "0" && !prev.includes(".")) return key;

      // enforce max decimal digits
      if (prev.includes(".")) {
        const [, frac = ""] = prev.split(".");
        if (frac.length >= maxFractionDigits) return prev;
      }

      return prev + key;
    });
  }

  const onBackspace = () => {
    setAmount((prev) => {
      if (!prev) return "";
      if (prev.length === 1) return "";
      return prev.slice(0, -1);
    });
  };

  function onEnter() {
    const normalizedAmount = amount.endsWith(".") ? amount.slice(0, -1) : amount;
    const cost = Number(normalizedAmount) * multiplier;
    if (!Number.isFinite(cost) || cost <= 0) return;
    setDraftItem((prev) => ({ ...prev, cost }));
    setCostModal(false);
    setNameModal(true);
  }

  const onChangeCurrency = async (newCurrency: string) => {
    const oldCurrency = currency;
    setCurrency(newCurrency);
    setAmount("");
    setDraftItem((prev) => ({ ...prev, currency: newCurrency }));

    try {
      await settingsMutateAsync({ type: "changeCurrency", workspaceId, currency: newCurrency });
    } catch {
      // revert UI if failed
      setCurrency(oldCurrency);
      setDraftItem((prev) => ({ ...prev, currency: oldCurrency }));
    }
  };

  return (
    <Modal title="Enter Cost" setIsOpen={setCostModal} disableCloseButton={isPending}>
      <div className="flex flex-col items-center">
        <div className="relative mb-8 mx-auto grid grid-cols-[auto_1fr] min-w-[calc(4.75rem*3+0.5rem*2)] desktop:min-w-[calc(3.25rem*3+0.375rem*2)] max-w-full overflow-hidden border-2 rounded-xl border-blue-500/20">
          {/*--- amount + currency ---*/}
          <div className="relative flex items-center">
            <select
              className="bg-transparent pl-2 pr-5 desktop:pl-1 desktop:pr-4 text-2xl desktop:text-base font-semibold appearance-none cursor-pointer"
              value={currency}
              onChange={(e) => onChangeCurrency(e.currentTarget.value)}
              disabled={isPending}
              aria-label="Currency"
            >
              {CURRENCIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-sm desktop:text-xs opacity-80" />
          </div>
          <div className="px-[10px] py-3 desktop:pr-2 desktop:py-2 text-4xl desktop:text-2xl font-semibold tabular-nums text-right border-l-2 border-blue-500/20">
            {amount || (decimals === 0 ? "0" : `0.${"0".repeat(decimals)}`)}
          </div>
          {multiplier > 1 && (
            <div className="absolute left-[calc(100%+8px)] text-base top-1/2 -translate-y-1/2 font-medium">x{multiplier}</div>
          )}
        </div>
        {/*--- keypad ---*/}
        <div className="grid grid-cols-3 gap-2 desktop:gap-1.5">
          {calc.map((i, index) => (
            <button
              key={index}
              type="button"
              className={`w-19 h-19 desktop:w-13 desktop:h-13 flex items-center justify-center text-2xl desktop:text-xl font-semibold bg-slate-200 dark:bg-blue-500/30 rounded-full select-none
                  ${
                    maxFractionDigits === 0 && i === "."
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-slate-300 dark:desktop:hover:bg-blue-500/40 active:scale-95 active:opacity-90 cursor-pointer"
                  }`}
              onClick={() => onClickNumber(i)}
              disabled={maxFractionDigits === 0 && i === "."}
              aria-label={i}
            >
              {i}
            </button>
          ))}

          <button
            type="button"
            className="w-19 h-19 desktop:w-13 desktop:h-13 flex items-center justify-center text-2xl desktop:text-xl font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-blue-500/30 dark:desktop:hover:bg-blue-500/40 rounded-full cursor-pointer select-none active:scale-95 active:opacity-90"
            onClick={onBackspace}
            aria-label="Backspace"
          >
            <FaDeleteLeft />
          </button>
        </div>

        {/* --- enter button --- */}
        <Button className="mt-12 desktop:mt-8" label="Enter" type="button" onClick={onEnter} disabled={isPending} />
      </div>
    </Modal>
  );
}
