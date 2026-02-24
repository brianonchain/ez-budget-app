import { useState } from "react";
import Header from "./Header";
import { FaDeleteLeft } from "react-icons/fa6";
import { Item } from "@/db/UserModel";
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/Modal";

const calc = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0"];

export default function EnterCost({
  setCostModal,
  setNameModal,
  setNewItem,
}: {
  setCostModal: React.Dispatch<React.SetStateAction<boolean>>;
  setNameModal: React.Dispatch<React.SetStateAction<boolean>>;
  setNewItem: React.Dispatch<React.SetStateAction<Item>>;
}) {
  const [amount, setAmount] = useState("");
  return (
    <Modal title="Enter Cost" setIsOpen={setCostModal}>
      <div className="mx-auto w-full flex flex-col items-center">
        {/*--- amount ---*/}
        <div className="pb-[30px] text-5xl desktop:text-4xl font-semibold">{amount || "0.00"}</div>
        {/*--- keypad ---*/}
        <div className="grid grid-cols-3 gap-[8px] desktop:gap-[6px]">
          {calc.map((i, index) => (
            <div
              key={index}
              className="w-[90px] h-[90px] desktop:w-[52px] desktop:h-[52px] flex items-center justify-center text-3xl desktop:text-xl font-medium bg-slate-200 hover:bg-slate-300 dark:bg-blue-500/30 dark:desktop:hover:bg-blue-500/40 rounded-full cursor-pointer select-none"
              onClick={() => {
                setAmount((amount) => amount + i);
              }}
            >
              {i}
            </div>
          ))}
          <div
            className="w-[90px] h-[90px] desktop:w-[52px] desktop:h-[52px] flex items-center justify-center text-3xl desktop:text-xl font-medium bg-slate-200 hover:bg-slate-300 dark:bg-blue-500/30 dark:desktop:hover:bg-blue-500/40 rounded-full cursor-pointer select-none"
            onClick={() => {
              if (amount.length > 1) {
                setAmount(amount.slice(0, -1));
              } else {
                setAmount("");
              }
            }}
          >
            <FaDeleteLeft />
          </div>
        </div>
        {/*--- button ---*/}
        <Button
          className="mt-[60px] desktop:mt-[32px]"
          label="Enter"
          onClick={() => {
            setNewItem((prev) => ({ ...prev, cost: Number(amount) }));
            setCostModal(false);
            setNameModal(true);
          }}
        />
      </div>
    </Modal>
  );
}
