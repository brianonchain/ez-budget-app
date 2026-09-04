"use client";

import { useEffect, useId } from "react";
import { useIsPresent } from "framer-motion";
import SimpleModal from "@/utils/components/simpleModal/SimpleModal";
import Button from "@/utils/components/Button";
import { FaTriangleExclamation } from "react-icons/fa6";
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
      <div className="w-full flex flex-col items-center gap-6 tablet:gap-8 desktop:gap-10">
        <FaTriangleExclamation className="text-4xl text-textDanger" />
        <p id={messageId}>{errorMessage}</p>
        <Button className="w-full" label="Close" variant="primary" size="base" onClick={onClose} />
      </div>
    </SimpleModal>
  );
}
