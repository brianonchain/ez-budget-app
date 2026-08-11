"use client";

import { useId } from "react";
import { createPortal } from "react-dom";
import { FocusTrap } from "focus-trap-react";
import { motion } from "framer-motion";
import Button from "@/utils/components/Button";
import NoHeaderModalGlow from "./NoHeaderModalGlow";

export default function DeleteModal({
  message,
  onClose,
  onDelete,
  insideModal = true,
  disabled = false,
  isLoading = false,
}: {
  message: string;
  onClose: () => void;
  onDelete: () => void;
  insideModal?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const titleId = useId();
  const descriptionId = useId();

  const content = (
    <>
      <motion.div
        className="z-[200] fixed inset-0 bg-black/70 backdrop-blur-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />

      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
          allowOutsideClick: (e) => {
            const target = e.target as HTMLElement | null;
            return !!target?.closest("[data-allow-click='true']");
          },
        }}
      >
        <motion.div
          className="app textBase z-[210] fixed left-1/2 top-1/2 w-full max-w-[calc(100%-2rem)] tablet:max-w-100 desktop:max-w-80 -translate-x-1/2 -translate-y-1/2 p-6 tablet:p-8 desktop:px-7 rounded-2xl overflow-hidden modalColor border border-inputPrimaryBorder shadow-2xl"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <NoHeaderModalGlow />
          <div className="relative flex flex-col items-center text-center">
            <p id={descriptionId} className="textBase text-textPrimary mt-2">
              {message}
            </p>
            <div className="mt-7 desktop:mt-8 grid w-full grid-cols-2 gap-3">
              <Button label="Cancel" variant="primary" size="base" onClick={onClose} disabled={disabled || isLoading} />
              <Button label="Delete" variant="dangerOutline" size="base" onClick={onDelete} disabled={disabled} isLoading={isLoading} />
            </div>
          </div>
        </motion.div>
      </FocusTrap>
    </>
  );

  if (insideModal) return content;

  return createPortal(content, document.body);
}
