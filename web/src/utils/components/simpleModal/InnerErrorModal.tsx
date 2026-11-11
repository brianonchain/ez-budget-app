"use client";
import { useEffect, useId } from "react";
import { useIsPresent } from "framer-motion";
// components
import SimpleModal from "@/utils/components/simpleModal/SimpleModal";
import { Button } from "@/utils/components/controls/Button";
import ErrorIcon from "@/utils/components/ErrorIcon";
import { useInnerBackdrop } from "@/utils/components/modal/Modal";

export default function InnerErrorModal({ errorMessage, onClose }: { errorMessage: string; onClose: () => void }) {
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
        <ErrorIcon />
        <p id={messageId} className="textLg">
          {errorMessage}
        </p>
        <Button className="w-full" text="Close" onClick={onClose} />
      </div>
    </SimpleModal>
  );
}
