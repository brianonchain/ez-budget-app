"use client";

import { useId, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FocusTrap } from "focus-trap-react";

// mobile/tablet = FULL SCREEN, desktop = MODAL
export default function Modal({
  title,
  onClose,
  disableClose = false,
  desktopWidth = "",
  contentMaxWidth = "",
  children,
}: {
  title: string;
  onClose: () => void;
  disableClose?: boolean;
  desktopWidth?: string;
  contentMaxWidth?: string;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <>
      <div className="z-[100] fixed inset-0 bg-black/70" aria-hidden />
      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
          allowOutsideClick: (e) => {
            const target = e.target as HTMLElement | null;
            return !!target?.closest("[data-allow-click='true']");
          },
        }}
      >
        <div
          className={`app textBase z-[110] fixed inset-0 desktop:inset-auto desktop:left-1/2 desktop:top-1/2 desktop:-translate-x-1/2 desktop:-translate-y-1/2 desktop:pb-3 desktop:w-[90%] desktop:max-w-104 ${desktopWidth} desktop:max-h-[90dvh] desktop:rounded-2xl flex flex-col items-center overflow-hidden modalColor`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          {/*--- glow ---*/}
          <div className="absolute w-[200dvw] desktop:w-[200%] h-[100dvh] left-1/2 -translate-x-1/2 z-[-1] modalGlow" />

          {/*--- modal header ---*/}
          <div className="relative w-full flex items-center justify-center">
            {/*--- close ---*/}
            <button
              className="absolute right-4 tablet:right-6 desktop:right-0 desktop:top-0 desktop:w-13 desktop:h-13 text-[2rem] desktop:text-[1.5rem] font-bold flex items-center justify-center desktop:rounded-bl-2xl desktop:rounded-tr-2xl desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover [transition:background-color_300ms]"
              onClick={onClose}
              disabled={disableClose}
              type="button"
              aria-label="Close"
            >
              &#10005;
            </button>
            {/*--- title ---*/}
            <h2 id={titleId} className="mx-[60px] py-4 tablet:py-6 text-center textXl font-semibold">
              {title}
            </h2>
          </div>

          {/*--- content ---*/}
          <div className="flex-1 min-h-0 overflow-y-auto pt-6 desktop:pt-2 pb-12 desktop:pb-8 px-4 tablet:px-8 desktop:px-10 w-full thinScrollbar">
            {/*--- max-w here mainly defines mobile/tablet content width  ---*/}
            <div className={`mx-auto w-full max-w-100 ${contentMaxWidth} desktop:max-w-none flex flex-col`}>{children}</div>
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
