import { useState, useEffect, useRef } from "react";
import { DraftItem } from "@/utils/types";
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/modal/Modal";
import ErrorMessage from "@/utils/components/ErrorMessage";
import type { Direction } from "@/utils/types";
import { DESKTOP_MQ } from "@/utils/constants";

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

  // useRef and useState used to create at delay for autoFocus
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const isDesktop = window.matchMedia(DESKTOP_MQ).matches;
    console.log("isDesktop", isDesktop);
    if (isDesktop) return;
    const timer = setTimeout(() => {
      textAreaRef.current?.focus({ preventScroll: true });
    }, 320);
    return () => clearTimeout(timer);
  }, []);

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
      <form onSubmit={handleSubmit} className="mt-6 desktop:pt-0 w-full">
        <div className="w-full">
          <textarea
            ref={textAreaRef}
            value={description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(e) => setDescription(e.currentTarget.value.slice(0, MAX_DESCRIPTION_LENGTH))}
            className="p-4 desktop:p-4 w-full h-24 desktop:h-20 textXl rounded-2xl inputPrimaryColor"
            placeholder="Enter a short item description"
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
