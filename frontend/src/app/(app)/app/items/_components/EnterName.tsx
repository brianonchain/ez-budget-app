import { useState, useEffect, useRef } from "react";
import { Item } from "@/db/UserModel";
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/Modal";

export default function EnterName({
  setNameModal,
  setDetailsModal,
  setNewItem,
}: {
  setNameModal: React.Dispatch<React.SetStateAction<boolean>>;
  setDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
  setNewItem: React.Dispatch<React.SetStateAction<Item>>;
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  return (
    <Modal title="Enter Name" setIsOpen={setNameModal}>
      <div className="mx-auto flex-none pt-[40px] desktop:pt-0 w-full max-w-[400px]">
        <textarea
          ref={inputRef}
          className="p-[16px] w-full h-[200px] desktop:h-[120px] text-2xl desktop:text-lg border rounded-2xl border-slate-400"
          placeholder="Enter a short item description"
        />
        <Button
          className="mt-[32px] desktop:mt-[32px]"
          label="Enter"
          onClick={() => {
            setNewItem((prev) => ({ ...prev, description: inputRef?.current?.value || "" }));
            setNameModal(false);
            setDetailsModal(true);
          }}
        />
      </div>
    </Modal>
  );
}
