"use client";
import { useId, useState, useEffect } from "react";
import { createPortal } from "react-dom";
// modal components
import ModalHeader from "./ModalHeader";
import ModalGlow from "./ModalGlow";
import ModalBody from "./ModalBody";
import { DESKTOP_MQ } from "@/utils/constants";
import { FocusTrap } from "focus-trap-react";
import { motion } from "framer-motion";

// mobile/tablet = FULL SCREEN, desktop = MODAL
export default function Modal({
  title,
  onClose,
  onBack,
  disableClose = false,
  desktopWidth = "",
  contentMaxWidth = "",
  children,
  direction = 0,
}: {
  title: string;
  onClose: () => void;
  onBack?: (() => void) | undefined;
  disableClose?: boolean;
  desktopWidth?: string;
  contentMaxWidth?: string;
  children: React.ReactNode;
  direction?: 1 | 0 | -1;
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
        className="hidden desktop:block z-[100] fixed inset-0 bg-black/70 backdrop-blur-xs"
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
          className={`app textBase fixed z-[110] w-dvw h-dvh left-0 top-0 desktop:left-1/2 desktop:top-1/2 desktop:-translate-x-1/2 desktop:-translate-y-1/2 desktop:pb-3 desktop:w-[90%] desktop:max-w-104 ${desktopWidth} desktop:h-auto desktop:max-h-[90dvh] desktop:rounded-2xl flex flex-col overflow-hidden modalColor`}
          custom={direction}
          variants={{
            initial: (direction: 1 | 0 | -1) => ({
              x: direction === 0 ? "100%" : direction === 1 ? "100%" : "-30%",
              zIndex: direction === -1 ? 110 : 112,
            }),
            animate: (direction: 1 | 0 | -1) => ({
              x: 0,
              zIndex: direction === -1 ? 110 : 112,
            }),
            exit: (direction: 1 | 0 | -1) => ({
              x: direction === 0 ? "100%" : direction === 1 ? "-30%" : "100%",
              zIndex: direction === -1 ? 112 : 110,
            }),
          }}
          initial={isDesktop ? { opacity: 0, scale: 0.98, y: 8 } : "initial"}
          animate={isDesktop ? { opacity: 1, scale: 1, y: 0 } : "animate"}
          exit={isDesktop ? { opacity: 0, scale: 0.98, y: 8 } : "exit"}
          transition={{
            duration: isDesktop ? 0.2 : 0.28,
            ease: "easeOut",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <ModalGlow />
          <ModalHeader id={titleId} title={title} onClose={onClose} onBack={onBack} disabled={disableClose} />
          <ModalBody contentMaxWidth={contentMaxWidth}>{children}</ModalBody>
        </motion.div>
      </FocusTrap>
    </>
  );

  return createPortal(content, document.body);
}
