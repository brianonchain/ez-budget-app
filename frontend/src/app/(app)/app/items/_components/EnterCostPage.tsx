import { useState } from "react";
import { FaDeleteLeft, FaChevronDown } from "react-icons/fa6";
import { AnimatePresence } from "framer-motion";
// components
import Button from "@/utils/components/Button";
import InnerErrorModal from "@/utils/components/simpleModal/InnerErrorModal";
// utils
import { useWorkspaceMutation } from "@/utils/hooks";
import { CURRENCIES, DECIMALS, MULTIPLIER } from "@/utils/constants";
import { DraftItem } from "@/utils/types";

const calc = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0"] as const;

export default function EnterCostModal({
  setDraftItem,
  defaultCurrency, // needed to show default currency
  workspaceId, // needed to set default currency
  onNext,
}: {
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
  defaultCurrency: string;
  workspaceId: string;
  onNext: () => void;
}) {
  // hooks
  const { mutateAsync: mutateWorkspaceAsync, isPending, error: currencyError } = useWorkspaceMutation();
  // states
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [errorMessage, setErrorMessage] = useState("");
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
    if (!Number.isFinite(cost) || cost <= 0) {
      setErrorMessage("Please enter a valid cost");
      return;
    }
    setDraftItem((prev) => ({ ...prev, cost }));
    onNext();
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
    <div className="flex flex-col items-center">
      {/*--- AMOUNT CONTAINER ---*/}
      <div className="relative w-full h-17 desktop:h-13 flex items-center">
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
          <FaChevronDown className="absolute right-3 pointer-events-none size-[0.875rem] desktop:size-[0.625rem] opacity-80" />
        </div>
        {/*--- amount ---*/}
        <div className="flex-none px-2 w-48 h-full flex items-center justify-center border-none border-slate-200 dark:border-blue-400/14 rounded-2xl text2xl font-semibold tabular-nums text-center">
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
          <Button
            key={index}
            label={i}
            variant="keypad"
            size="keypad"
            className={maxFractionDigits === 0 && i === "." ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}
            onClick={() => onClickNumber(i)}
            disabled={maxFractionDigits === 0 && i === "."}
            aria-label={i}
          />
        ))}
        <Button label={<FaDeleteLeft />} variant="keypad" size="keypad" onClick={onBackspace} aria-label="Backspace" />
      </div>

      {/* --- enter button --- */}
      <Button className="w-full mt-12 desktop:mt-6" label="Enter" variant="primary" size="base" onClick={onEnter} disabled={isPending} />

      {/*--- error modal ---*/}
      <AnimatePresence>
        {errorMessage && <InnerErrorModal errorMessage={errorMessage || "Unknown error"} onClose={() => setErrorMessage("")} />}
      </AnimatePresence>
    </div>
  );
}
