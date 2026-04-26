"use client";
import { createPortal } from "react-dom";
import Button from "./Button";
import { FaTriangleExclamation } from "react-icons/fa6";
import { FocusTrap } from "focus-trap-react";
import { motion } from "framer-motion";

export default function Modal({
  setErrorMessage,
  errorMessage,
}: {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  errorMessage: string;
}) {
  const content = (
    <>
      <motion.div
        className="z-[150] fixed inset-0 bg-black/70 backdrop-blur-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        aria-hidden
      />

      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
        }}
      >
        <motion.div
          className="app textBase z-[160] fixed py-2 w-[85%] max-w-90 max-h-[70dvh] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl flex flex-col overflow-hidden modalColor border"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
          role="alertdialog"
          aria-modal="true"
          aria-label="Error"
        >
          {/*--- glow ---*/}
          <div className="absolute w-[200dvw] desktop:w-[200%] h-[100dvh] left-1/2 -translate-x-1/2 z-[-1] modalGlow" />

          {/*--- content ---*/}
          <div className="flex-1 min-h-0 pt-6 pb-8 px-6 tablet:px-8 desktop:px-10 flex flex-col items-center gap-12 overflow-y-auto tablet:thinScroll">
            <FaTriangleExclamation className="mx-auto text-5xl text-textDanger" />
            <p>{errorMessage}</p>
            <Button className="w-full" label="Close" variant="primary" size="base" onClick={() => setErrorMessage("")} />
          </div>
        </motion.div>
      </FocusTrap>
    </>
  );

  return createPortal(content, document.body);
}
