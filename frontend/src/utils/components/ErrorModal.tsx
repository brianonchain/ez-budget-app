"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { FaTriangleExclamation, FaCircleXmark, FaRegCircleXmark } from "react-icons/fa6";

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
      <div
        className="z-[100] fixed py-2 w-[85dvw] max-w-90 max-h-[70dvh] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl flex flex-col overflow-hidden modalFullColor border"
        role="dialog"
        aria-modal="true"
        tabIndex={-1} // so modal is focusable with javascript
      >
        {/*--- glow ---*/}
        <div className="absolute w-[200%] h-[150%] right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-[-1] modalGlow dark:block hidden" />
        {/*--- content ---*/}
        <div className="flex-1 min-h-0 px-6 pt-6 pb-8 ortrait:sm:px-[32px] landscape:lg:px-[32px] desktop:!px-[48px] overflow-y-auto thinScrollbar">
          <FaTriangleExclamation className="mx-auto text-5xl text-textError" />
          <p className="mt-6">{errorMessage}</p>
          <Button className="mt-8 w-full" label="Close" variant="primary" size="base" onClick={() => setErrorMessage("")} />
        </div>
      </div>
    </>
  );

  // Portal to document.body so the modal is outside the app layout and always stacks above the bottom nav (avoids production stacking-context issues)
  if (mounted && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}
