"use client";
import { useId, useEffect } from "react";
import { useIsPresent } from "framer-motion";
import SimpleModal from "@/utils/components/simpleModal/SimpleModal";
import { Button } from "@/utils/components/controls/Button";
import { useInnerBackdrop } from "../modal/Modal";

export default function InnerDeleteModal({
  message,
  onClose,
  onDelete,
  disabled = false,
  isLoading = false,
}: {
  message: string;
  onClose: () => void;
  onDelete: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const messageId = useId();
  const isPresent = useIsPresent();
  const setInnerBackdrop = useInnerBackdrop();

  useEffect(() => {
    setInnerBackdrop(isPresent);
    return () => setInnerBackdrop(false);
  }, [isPresent, setInnerBackdrop]);

  return (
    <SimpleModal ariaLabel="Confirm delete" messageId={messageId} isInnerModal={true}>
      <div className="w-full flex flex-col items-center gap-8 tablet:gap-12 desktop:gap-10">
        <p id={messageId} className="textLg">
          {message}
        </p>
        <div className="w-full grid grid-cols-2 gap-4 tablet:gap-6 desktop:gap-4">
          <Button text="Cancel" onClick={onClose} disabled={disabled || isLoading} />
          <Button text="Delete" variant="destructive" onClick={onDelete} disabled={disabled} isLoading={isLoading} />
        </div>
      </div>
    </SimpleModal>
  );
}
