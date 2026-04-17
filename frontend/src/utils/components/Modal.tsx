"use client";
import { useId, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FocusTrap } from "focus-trap-react";
import { motion } from "framer-motion";
import { DESKTOP_MQ } from "../constants";
import ModalHeader from "./ModalHeader";

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
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== "undefined" ? window.matchMedia(DESKTOP_MQ).matches : false));

  // listen to changes in window size
  // only edge case I can think of: in desktop, user changes screen size between desktop and tablet breakpoint. Without this useEffect, exit animation would be weird.
  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MQ);
    function handleChange(e: MediaQueryListEvent) {
      setIsDesktop(e.matches);
    }
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const content = (
    <>
      <motion.div
        className="z-[100] fixed inset-0 bg-black/70 backdrop-blur-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
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
          className={`app textBase z-[110] fixed inset-0 desktop:inset-auto desktop:left-1/2 desktop:top-1/2 desktop:-translate-x-1/2 desktop:-translate-y-1/2 desktop:pb-3 desktop:w-[90%] desktop:max-w-104 ${desktopWidth} desktop:max-h-[90dvh] desktop:rounded-2xl flex flex-col items-center overflow-hidden modalColor`}
          initial={isDesktop ? { opacity: 0, scale: 0.98, y: 8 } : { x: "100%" }}
          animate={isDesktop ? { opacity: 1, scale: 1, y: 0 } : { x: 0 }}
          exit={isDesktop ? { opacity: 0, scale: 0.98, y: 8 } : { x: "100%" }}
          transition={{
            duration: isDesktop ? 0.2 : 0.28,
            ease: "easeOut",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          {/*--- glow ---*/}
          <div className="absolute w-[200dvw] desktop:w-[200%] h-[100dvh] left-1/2 -translate-x-1/2 z-[-1] modalGlow" />

          {/*--- modal header ---*/}
          <ModalHeader id={titleId} title={title} onClose={onClose} disabled={disableClose} />

          {/*--- content ---*/}
          <div className="flex-1 min-h-0 overflow-y-auto pt-6 desktop:pt-2 pb-12 desktop:pb-8 px-4 tablet:px-8 desktop:px-10 w-full thinScrollbar">
            {/*--- max-w here mainly defines mobile/tablet content width  ---*/}
            <div className={`mx-auto w-full max-w-100 ${contentMaxWidth} desktop:max-w-none flex flex-col`}>{children}</div>
          </div>
        </motion.div>
      </FocusTrap>
    </>
  );

  return createPortal(content, document.body);
}
