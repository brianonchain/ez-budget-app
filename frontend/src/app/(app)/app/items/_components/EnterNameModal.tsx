import { useState } from "react";
import { DraftItem } from "@/utils/types";
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/modal/Modal";
import ErrorMessage from "@/utils/components/ErrorMessage";
import type { Direction } from "../ItemsClient";

export default function EnterNameModal({
  setDraftItem,
  onClose,
  // multipage modal props
  direction,
  onBack,
  onForward,
}: {
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
  onClose: () => void;
  // multipage modal props
  direction: Direction;
  onBack: () => void;
  onForward: () => void;
}) {
  const MAX_DESCRIPTION_LENGTH = 30;
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage("Enter an item description");
      return;
    }
    setDraftItem((prev) => ({ ...prev, description }));
    onForward();
  }

  return (
    <Modal title="Enter Name" onClose={onClose} direction={direction} onBack={onBack}>
      <form onSubmit={handleSubmit} className="pt-10 desktop:pt-0 w-full">
        <div className="w-full">
          <textarea
            value={description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(e) => setDescription(e.currentTarget.value.slice(0, MAX_DESCRIPTION_LENGTH))}
            className="p-4 desktop:p-4 w-full h-40 desktop:h-30 textXl rounded-2xl inputPrimaryColor"
            placeholder="Enter a short item description"
            autoFocus
          />
          <div className="mt-1 flex justify-end text-textTertiary">
            {description.length}/{MAX_DESCRIPTION_LENGTH} characters
          </div>
        </div>
        <ErrorMessage message={errorMessage} />
        <Button className="w-full" label="Enter" variant="primary" size="base" type="submit" />
      </form>
    </Modal>
  );
}
