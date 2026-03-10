import { useState, useEffect, useRef } from "react";
import { DraftItem } from "@/utils/types";
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/Modal";

export default function EnterName({
  setNameModal,
  setDetailsModal,
  setDraftItem,
}: {
  setNameModal: React.Dispatch<React.SetStateAction<boolean>>;
  setDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  return (
    <Modal title="Enter Name" setModal={setNameModal}>
      <div className="mx-auto flex-none pt-10 desktop:pt-0 w-full max-w-100">
        <textarea
          ref={inputRef}
          className="p-4 w-full h-50 desktop:h-30 text-2xl desktop:text-lg rounded-2xl inputColor outline-none"
          placeholder="Enter a short item description"
          autoFocus
        />
        <Button
          className="mt-8"
          label="Enter"
          onClick={() => {
            setDraftItem((prev) => ({ ...prev, description: inputRef?.current?.value || "" }));
            setNameModal(false);
            setDetailsModal(true);
          }}
        />
      </div>
    </Modal>
  );
}
