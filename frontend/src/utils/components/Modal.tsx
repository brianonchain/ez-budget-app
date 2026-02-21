"use client";

import { useId, useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  children,
  disableCloseButton = false,
  setIsOpen,
  title,
}: {
  children: React.ReactNode;
  disableCloseButton?: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <>
      <div className="z-[99] fixed w-full h-dvh top-0 left-0 bg-black/70" aria-hidden />
      <div
        className="z-[100] fixed w-full h-dvh desktop:w-[400px] desktop:h-auto desktop:max-h-[90%] desktop:pb-[12px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col desktop:rounded-2xl overflow-hidden modalFullColor"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1} // so modal is focusable with javascript
      >
        {/*--- glow ---*/}
        <div className="absolute inset-0 bg-gradient-to-br from-lightBg1 to-lightBg1 dark:from-blue-500/20 dark:to-blue-500/10 z-[-1]"></div>
        {/*--- close ---*/}
        {!disableCloseButton && (
          <button className="xButton" aria-label="Close" type="button" onClick={() => setIsOpen(false)}>
            &#10005;
          </button>
        )}
        {/*--- title ---*/}
        <div id={titleId} className="modalFullHeader">
          {title}
        </div>
        {/*--- content ---*/}
        <div className="modalFullContentContainer">{children}</div>
      </div>
    </>
  );

  // Portal to document.body so the modal is outside the app layout and always stacks above the bottom nav (avoids production stacking-context issues)
  if (mounted && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}
