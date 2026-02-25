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
      <div className="z-[99] fixed inset-0 bg-black/70" aria-hidden />
      <div
        className="z-[100] fixed inset-0 desktop:inset-auto desktop:w-[400px] desktop:max-h-[90dvh] desktop:pb-[12px] desktop:left-1/2 desktop:top-1/2 desktop:-translate-x-1/2 desktop:-translate-y-1/2 desktop:rounded-2xl flex flex-col overflow-hidden modalFullColor"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1} // so modal is focusable with javascript
      >
        {/*--- glow ---*/}
        <div className="absolute inset-0 bg-gradient-to-br from-lightBg1 to-lightBg1 dark:from-blue-500/20 dark:to-blue-500/10 z-[-1]" />
        {/*--- close ---*/}
        {!disableCloseButton && (
          <button className="xButton" aria-label="Close" type="button" onClick={() => setIsOpen(false)}>
            &#10005;
          </button>
        )}
        {/*--- title ---*/}
        <div id={titleId} className="mx-[60px] py-[24px] text-center text-2xl desktop:text-xl font-semibold">
          {title}
        </div>
        {/*--- content ---*/}
        <div
          className="flex-1 min-h-0 w-full pt-[16px] pb-[48px] px-[16px] portrait:sm:px-[32px] landscape:lg:px-[32px] desktop:!px-[60px] overflow-y-auto thinScrollbar textBaseApp"
          style={{ scrollbarGutter: "stable" }}
        >
          {children}
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
