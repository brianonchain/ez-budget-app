import { useState } from "react";
import Header from "./Header";
import { FaDeleteLeft } from "react-icons/fa6";
import { Item } from "@/db/UserModel";

const calc = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

export default function EnterCost({ page, setPage, setErrorModal, setNewItem }: { page: string; setPage: any; setErrorModal: any; setNewItem: any }) {
  const [amount, setAmount] = useState("");
  return (
    <>
      <Header title="Enter Cost" page={page} setPage={setPage} />

      {/*--- content ---*/}
      <div className="flex-none w-[350px] h-[500px] flex flex-col items-center">
        {/*--- amount ---*/}
        <div className="py-[30px] text-5xl font-bold">{amount || "0.00"}</div>
        {/*--- keypad ---*/}
        <div className="grid grid-cols-3 gap-[12px]">
          {calc.map((i, index) => (
            <div
              key={index}
              className="w-[90px] h-[72px] flex items-center justify-center text-xl font-medium bg-slate-200 rounded-[16px]"
              onClick={() => {
                setAmount((amount) => amount + i);
              }}
            >
              {i}
            </div>
          ))}
          <div
            className="w-[90px] h-[72px] flex items-center justify-center text-xl font-medium bg-slate-200 rounded-[16px]"
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
      </div>

      {/*--- button ---*/}
      <div className="w-[350px] py-[50px]">
        <button
          className="w-full button1 text-xl desktop:text-lg"
          onClick={() => {
            setNewItem((prevState: Item) => ({ ...prevState, cost: amount }));
            setPage("name");
          }}
        >
          Enter
        </button>
      </div>
    </>
  );
}
