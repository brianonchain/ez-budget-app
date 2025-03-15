import { useState, useEffect, useRef } from "react";
import Header from "./Header";
import { Item } from "@/db/UserModel";

export default function EnterName({ page, setPage, setErrorModal, setNewItem }: { page: string; setPage: any; setErrorModal: any; setNewItem: any }) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  return (
    <>
      <Header title="Enter Name" page={page} setPage={setPage} />

      {/*--- content ---*/}
      <div className="pt-[80px] flex-none w-[350px] h-[500px]">
        <textarea ref={inputRef} className="p-[16px] w-full h-[200px] text-2xl border rounded-[16px] border-slate-400" placeholder="Enter a short item description" />
      </div>

      {/*--- button ---*/}
      <div className="w-[350px] py-[50px]">
        <button
          className="w-full button1 text-xl desktop:text-lg"
          onClick={() => {
            setNewItem((prev: Item) => ({ ...prev, description: inputRef?.current?.value }));
            setPage("category");
          }}
        >
          Enter
        </button>
      </div>
    </>
  );
}
