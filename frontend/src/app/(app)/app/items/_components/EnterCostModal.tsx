import { useState } from "react";
import { FaDeleteLeft, FaChevronDown } from "react-icons/fa6";
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/modal/Modal";
import { useWorkspaceMutation } from "@/utils/hooks";
import { CURRENCIES, DECIMALS, MULTIPLIER } from "@/utils/constants";
import { DraftItem } from "@/utils/types";
import type { Direction } from "@/utils/types";

const calc = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0"] as const;

export default function EnterCostModal({
  setDraftItem,
  defaultCurrency,
  workspaceId,
  onClose,
  // multipage modal props
  direction,
  onForward,
}: {
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
  defaultCurrency: string;
  workspaceId: string;
  onClose: () => void;
  // multipage modal props
  direction: Direction;
  onForward: () => void;
}) {
  // hooks
  const { mutateAsync: mutateWorkspaceAsync, isPending, error: currencyError } = useWorkspaceMutation();
  // states
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  // constants
  const decimals = DECIMALS[currency];
  const multiplier = MULTIPLIER[currency];
  const maxFractionDigits = decimals + Math.log10(multiplier); // max digits after decimal when including the multiplier (100.123 VND = 100,123 VND)

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
    onForward();
  }

  const onChangeCurrency = async (newCurrency: string) => {
    const oldCurrency = currency;
    setCurrency(newCurrency);
    setAmount("");
    setDraftItem((prev) => ({ ...prev, currency: newCurrency }));

    try {
      await mutateWorkspaceAsync({ type: "changeCurrency", workspaceId, currency: newCurrency });
    } catch {
      // revert UI if failed
      setCurrency(oldCurrency);
      setDraftItem((prev) => ({ ...prev, currency: oldCurrency }));
    }
  };

  return (
    <Modal title="Enter Cost" onClose={onClose} disabled={isPending} direction={direction}>
      <div className="flex flex-col items-center">
        {/*--- AMOUNT CONTAINER ---*/}
        <div className="relative w-full h-18 desktop:h-13 flex items-center">
          {/*--- currency ---*/}
          <div className="relative flex-1 h-full flex items-center">
            <select
              className="pl-3 w-full h-full font-medium appearance-none"
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
            <FaChevronDown className="absolute right-3 pointer-events-none text-sm desktop:text-[0.625rem] opacity-80" />
          </div>
          {/*--- amount ---*/}
          <div className="flex-none px-2 w-48 h-full flex items-center justify-center border border-inputOutlineBorder rounded-2xl text2xl font-semibold tabular-nums text-center">
            {amount || (decimals === 0 ? "0" : `0.${"0".repeat(decimals)}`)}
          </div>
          {/*--- multiplier ---*/}
          <div className="flex-1">
            <div className="pl-2 font-medium">{multiplier > 1 ? `x${multiplier}` : ""}</div>
          </div>
        </div>
        {/*--- keypad ---*/}
        <div className="mt-8 desktop:mt-4 grid grid-cols-3 gap-2 desktop:gap-1">
          {calc.map((i, index) => (
            <button
              key={index}
              type="button"
              className={`w-20 h-20 desktop:w-12 desktop:h-12 flex items-center justify-center textXl font-semibold bg-slate-200 dark:bg-blue-500/30 rounded-full select-none
                  ${
                    maxFractionDigits === 0 && i === "."
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-slate-300 dark:desktop:hover:bg-blue-500/40 active:scale-95 active:opacity-90"
                  }`}
              onClick={() => onClickNumber(i)}
              disabled={maxFractionDigits === 0 && i === "."}
              aria-label={i}
            >
              {i}
            </button>
          ))}

          <button
            className="w-20 h-20 desktop:w-12 desktop:h-12 flex items-center justify-center textXl font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-blue-500/30 dark:desktop:hover:bg-blue-500/40 rounded-full select-none active:scale-95 active:opacity-90"
            onClick={onBackspace}
            type="button"
            aria-label="Backspace"
          >
            <FaDeleteLeft />
          </button>
        </div>

        {/* --- enter button --- */}
        <Button className="w-full mt-12 desktop:mt-6" label="Enter" variant="primary" size="base" onClick={onEnter} disabled={isPending} />
      </div>
    </Modal>
  );
}
