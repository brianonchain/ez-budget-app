import { useState, useEffect, useRef } from "react";
import Header from "./Header";
import { Item } from "@/db/UserModel";
import Button from "./Button";

export default function EnterName({ setPage, setErrorModal, setNewItem }: { setPage: any; setErrorModal: any; setNewItem: any }) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  return (
    <>
      <Header text="Enter Name" setPage={setPage} page="list" />

      {/*--- content ---*/}
      <div className="pt-[80px] flex-none w-[350px] h-[500px]">
        <textarea ref={inputRef} className="p-[16px] w-full h-[200px] text-2xl border rounded-[16px] border-slate-400" placeholder="Enter a short item description" />
        <Button
          className="w-full"
          text="Enter"
          onClick={() => {
            setNewItem((prev: Item) => ({ ...prev, description: inputRef?.current?.value }));
            setPage("category");
          }}
        />
      </div>
    </>
  );
}
