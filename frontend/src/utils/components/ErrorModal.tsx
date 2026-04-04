"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { FaTriangleExclamation, FaCircleXmark, FaRegCircleXmark } from "react-icons/fa6";
import { FocusTrap } from "focus-trap-react";
export default function Modal({
  setErrorMessage,
  errorMessage,
}: {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  errorMessage: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <>
      <div className="z-[99] fixed inset-0 bg-black/70" aria-hidden />
      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
        }}
      >
        <div
          className="app textBase z-[100] fixed py-2 w-[85dvw] max-w-90 max-h-[70dvh] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl flex flex-col overflow-hidden modalColor border"
          role="dialog"
          aria-modal="true"
        >
          {/*--- glow ---*/}
          <div className="absolute w-[200%] h-[150%] right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-[-1] modalGlow dark:block hidden" />
          {/*--- content ---*/}
          <div className="flex-1 min-h-0 pt-6 pb-8 px-6 tablet:px-8 desktop:px-10 overflow-y-auto tablet:thinScrollbar">
            <FaTriangleExclamation className="mx-auto text-5xl text-textDanger" />
            <p className="mt-6">{errorMessage}</p>
            <Button className="mt-8 w-full" label="Close" variant="primary" size="base" onClick={() => setErrorMessage("")} />
          </div>
        </div>
      </FocusTrap>
    </>
  );

  // Portal to document.body so the modal is outside the app layout and always stacks above the bottom nav (avoids production stacking-context issues)
  if (mounted && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}
