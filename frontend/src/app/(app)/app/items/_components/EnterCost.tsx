import { useState, useMemo } from "react";
import { FaDeleteLeft, FaChevronDown } from "react-icons/fa6";
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/Modal";
import { useSettingsMutation } from "@/utils/hooks";
import { Item } from "@/db/UserModel";
import { CURRENCIES, DECIMALS, MULTIPLIER } from "@/utils/constants";
import { Currency } from "@/utils/types";

const calc = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0"] as const;

export default function EnterCost({
  setCostModal,
  setNameModal,
  setNewItem,
  defaultCurrency,
}: {
  setCostModal: React.Dispatch<React.SetStateAction<boolean>>;
  setNameModal: React.Dispatch<React.SetStateAction<boolean>>;
  setNewItem: React.Dispatch<React.SetStateAction<Item>>;
  defaultCurrency: string;
}) {
  // hooks
  const { mutateAsync: settingsMutateAsync, isPending: isSavingCurrency, error: currencyError } = useSettingsMutation();
  // states
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>(defaultCurrency as Currency);
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
    setNewItem((prev) => ({ ...prev, cost }));
    setCostModal(false);
    setNameModal(true);
  }

  const onChangeCurrency = async (newCurrency: Currency) => {
    const oldCurrency = currency; // store prev state
    setCurrency(newCurrency); // optimistic update
    setAmount(""); // reset amount
    try {
      await settingsMutateAsync({ type: "changeCurrency", currency: newCurrency });
    } catch {
      setCurrency(oldCurrency); // revert UI if failed
    }
  };

  return (
    <Modal title="Enter Cost" setIsOpen={setCostModal} disableCloseButton={isSavingCurrency}>
      <div className="flex flex-col items-center">
        <div className="relative mb-[30px] mx-auto grid grid-cols-[auto_1fr] min-w-[calc(76px*3+8px*2)] desktop:min-w-[calc(52px*3+6px*2)] max-w-full overflow-hidden border-2 rounded-xl border-blue-500/20">
          {/*--- amount + currency ---*/}
          <div className="relative flex items-center">
            <select
              className="bg-transparent pl-[8px] pr-[19px] desktop:pl-[4px] desktop:pr-[14px] text-2xl desktop:text-base font-semibold appearance-none cursor-pointer"
              value={currency}
              onChange={(e) => onChangeCurrency(e.currentTarget.value as Currency)}
              disabled={isSavingCurrency}
              aria-label="Currency"
            >
              {CURRENCIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-[4px] desktop:right-[3px] top-1/2 -translate-y-1/2 pointer-events-none text-[14px] desktop:text-[10px] opacity-80" />
          </div>
          <div className="px-[10px] py-3 desktop:pr-2 desktop:py-2 text-4xl desktop:text-2xl font-semibold tabular-nums text-right border-l-2 border-blue-500/20">
            {amount || (decimals === 0 ? "0" : `0.${"0".repeat(decimals)}`)}
          </div>
          {multiplier > 1 && (
            <div className="absolute left-[calc(100%+8px)] text-base top-1/2 -translate-y-1/2 font-medium">x{multiplier}</div>
          )}
        </div>
        {/*--- keypad ---*/}
        <div className="grid grid-cols-3 gap-[8px] desktop:gap-[6px]">
          {calc.map((i, index) => (
            <button
              key={index}
              type="button"
              className={`w-[76px] h-[76px] desktop:w-[52px] desktop:h-[52px] flex items-center justify-center text-2xl desktop:text-xl font-semibold bg-slate-200 dark:bg-blue-500/30 rounded-full select-none
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
            className="w-[76px] h-[76px] desktop:w-[52px] desktop:h-[52px] flex items-center justify-center text-2xl desktop:text-xl font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-blue-500/30 dark:desktop:hover:bg-blue-500/40 rounded-full cursor-pointer select-none active:scale-95 active:opacity-90"
            onClick={onBackspace}
            aria-label="Backspace"
          >
            <FaDeleteLeft />
          </button>
        </div>

        {/* --- enter button --- */}
        <Button className="mt-[60px] desktop:mt-[32px]" label="Enter" type="button" onClick={onEnter} disabled={isSavingCurrency} />
      </div>
    </Modal>
  );
}
