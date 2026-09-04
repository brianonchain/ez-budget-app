import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "@/utils/components/Button";
import InnerErrorModal from "@/utils/components/simpleModal/InnerErrorModal";
import { DraftItem } from "@/utils/types";

const MAX_DESCRIPTION_LENGTH = 30;

export default function EnterNameModal({
  setDraftItem,
  onNext,
}: {
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
  onNext: () => void;
}) {
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // must focus synchronously on mount or iOS won't treat it as part of the tap and the keyboard stays down;
  // preventScroll stops the browser from dragging the offscreen page in mid-transition
  useLayoutEffect(() => {
    textareaRef.current?.focus({ preventScroll: true });
  }, []);

  // below hides cursor until animation finishes
  useEffect(() => {
    const timer = setTimeout(() => setShowCursor(true), 600);
    return () => clearTimeout(timer);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage("Enter an item description");
      return;
    }
    setDraftItem((prev) => ({ ...prev, description }));
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 desktop:pt-0 w-full">
      <div className="w-full">
        <textarea
          ref={textareaRef}
          value={description}
          rows={2}
          maxLength={MAX_DESCRIPTION_LENGTH}
          onChange={(e) => setDescription(e.currentTarget.value.slice(0, MAX_DESCRIPTION_LENGTH))}
          className={`p-4 desktop:p-4 w-full textXl rounded-2xl inputPrimaryColor ${showCursor ? "" : "caret-transparent"}`}
          placeholder="Enter a short description"
        />
        <div className="mt-1 pr-0.5 flex justify-end text-textTertiary">
          {description.length}/{MAX_DESCRIPTION_LENGTH} characters
        </div>
      </div>
      <Button className="mt-12 desktop:mt-8 w-full" label="Enter" variant="primary" size="base" type="submit" />

      {/*--- error modal ---*/}
      <AnimatePresence>
        {errorMessage && <InnerErrorModal errorMessage={errorMessage || "Unknown error"} onClose={() => setErrorMessage("")} />}
      </AnimatePresence>
    </form>
  );
}
