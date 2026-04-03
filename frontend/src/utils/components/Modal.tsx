"use client";

import { useId, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FocusTrap } from "focus-trap-react";

// mobile/tablet = FULL SCREEN, desktop = MODAL
export default function Modal({
  children,
  disableCloseButton = false,
  setModal,
  title,
}: {
  children: React.ReactNode;
  disableCloseButton?: boolean;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
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

      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
        }}
      >
        <div
          className="app textBase z-[100] fixed inset-0 desktop:inset-auto desktop:w-104 desktop:max-h-[90dvh] desktop:pb-3 desktop:left-1/2 desktop:top-1/2 desktop:-translate-x-1/2 desktop:-translate-y-1/2 desktop:rounded-2xl flex flex-col items-center overflow-hidden modalColor"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          {/*--- glow ---*/}
          <div className="absolute w-[200dvw] desktop:w-[200%] h-[100dvh] left-1/2 -translate-x-1/2 z-[-1] modalGlow" />

          {/*--- desktop:close ---*/}
          <button className="xButton" onClick={() => setModal(false)} disabled={disableCloseButton} type="button" aria-label="Close">
            &#10005;
          </button>
          {/*--- title ---*/}
          <h2 id={titleId} className="mx-[60px] py-6 text-center textXl font-semibold">
            {title}
          </h2>

          {/*--- content (max-w-110 controls content width on tablets, desktop:max-w-104 above controls content width on desktops) ---*/}
          <div className="flex-1 min-h-0 overflow-y-auto w-full flex flex-col items-center pb-6 px-4 portrait:sm:px-8 landscape:lg:px-8 desktop:!px-10 textBase thinScrollbar scrollbar-stable">
            {/*--- this inner div not needed if only mobile was full screen ---*/}
            <div className="w-full max-w-100">{children}</div>
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
