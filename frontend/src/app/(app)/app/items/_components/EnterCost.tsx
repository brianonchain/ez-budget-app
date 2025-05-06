import { useState } from "react";
import Header from "./Header";
import { FaDeleteLeft } from "react-icons/fa6";
import { Item } from "@/db/UserModel";
import Button from "./Button";

const calc = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

export default function EnterCost({ setPage, setErrorModal, setNewItem }: { setPage: any; setErrorModal: any; setNewItem: any }) {
  const [amount, setAmount] = useState("");
  return (
    <>
      <Header text="Enter Cost" setPage={setPage} page="list" />

      {/*--- content ---*/}
      <div className="flex-none w-[350px] flex flex-col items-center">
        {/*--- amount ---*/}
        <div className="py-[30px] text-5xl font-bold">{amount || "0.00"}</div>
        {/*--- keypad ---*/}
        <div className="grid grid-cols-3 gap-[12px]">
          {calc.map((i, index) => (
            <div
              key={index}
              className="w-[90px] h-[72px] flex items-center justify-center text-xl font-medium bg-slate-200 dark:bg-blue-500/30 dark:desktop:hover:bg-blue-500/40 rounded-2xl cursor-pointer"
              onClick={() => {
                setAmount((amount) => amount + i);
              }}
            >
              {i}
            </div>
          ))}
          <div
            className="w-[90px] h-[72px] flex items-center justify-center text-xl font-medium bg-slate-200 dark:bg-blue-500/30 dark:desktop:hover:bg-blue-500/40 rounded-2xl cursor-pointer"
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
          className="w-[294px]"
          text="Enter"
          onClick={() => {
            setNewItem((prevState: Item) => ({ ...prevState, cost: amount }));
            setPage("name");
          }}
        />
      </div>
    </>
  );
}
