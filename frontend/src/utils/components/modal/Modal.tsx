"use client";
import { useId, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FocusTrap } from "focus-trap-react";
import { motion } from "framer-motion";
// components
import ModalGlow from "./ModalGlow";
import ModalHeader from "./ModalHeader";
// constants and types
import { TABLET_MQ } from "@/utils/constants";
import type { Direction } from "@/utils/types";

const tabletOrDesktopVariants = {
  initial: { opacity: 0, scale: 0.98, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 8 },
};
const mobileVariants = {
  initial: (direction: Direction) => ({ x: direction === -1 ? "-30%" : "100%", zIndex: direction === -1 ? 110 : 112 }),
  animate: (direction: Direction) => ({ x: 0, zIndex: direction === -1 ? 110 : 112 }),
  exit: (direction: Direction) => ({ x: direction === 1 ? "-30%" : "100%", zIndex: direction === -1 ? 112 : 110 }),
};

export default function Modal({
  children,
  title,
  onClose,
  disabled = false,
  maxWidth = "",
  contentMaxWidth = "",
  // multipage modal props
  isMulti = false,
  direction = 0,
  onBack,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
  disabled?: boolean;
  maxWidth?: string;
  contentMaxWidth?: string;
  // multipage modal props
  isMulti?: boolean;
  direction?: Direction;
  onBack?: (() => void) | undefined;
}) {
  const titleId = useId();
  const [isTabletOrDesktop, setIsTabletOrDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(TABLET_MQ).matches : false,
  );

  // listen to changes in window size
  // only edge case I can think of: in desktop, user changes screen size between desktop and tablet breakpoint. Without this useEffect, exit animation would be weird.
  useEffect(() => {
    const mediaQuery = window.matchMedia(TABLET_MQ);
    function handleChange(e: MediaQueryListEvent) {
      setIsTabletOrDesktop(e.matches);
    }
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const content = (
    <>
      {!isMulti && (
        <motion.div
          className="hidden tablet:block z-[100] fixed inset-0 bg-black/50 backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
      )}

      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
          allowOutsideClick: (e) => {
            const target = e.target as HTMLElement | null;
            return !!target?.closest("[data-allow-click='true']");
          },
        }}
      >
        {/*--- overflow-hidden needed to clip glow ---*/}
        <motion.div
          className={`app textBase z-[110] fixed inset-0 tablet:inset-auto tablet:left-1/2 tablet:top-1/2 tablet:-translate-x-1/2 tablet:-translate-y-1/2 tablet:pb-3 tablet:w-[90%] tablet:max-w-140 desktop:max-w-110 ${maxWidth} tablet:max-h-[90dvh] flex flex-col tablet:roundedModal overflow-hidden modalColor`}
          custom={direction}
          variants={isTabletOrDesktop ? tabletOrDesktopVariants : mobileVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: isTabletOrDesktop ? 0.28 : 0.52,
            ease: isTabletOrDesktop ? [0.22, 1, 0.36, 1] : [0.32, 0.72, 0, 1],
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <ModalGlow />
          <ModalHeader id={titleId} title={title} onClose={onClose} disabled={disabled} onBack={onBack} />
          {/*--- content, note pb-3 in main div ---*/}
          <div className="flex-1 min-h-0 overflow-y-auto pt-6 tablet:pt-2 pb-12 tablet:pb-9 desktop:pb-7 px-4 tablet:px-12 desktop:px-10 w-full tablet:thinScroll">
            {/*--- max-w here mainly defines mobile/tablet content width  ---*/}
            <div className={`mx-auto w-full max-w-100 ${contentMaxWidth} tablet:max-w-none flex flex-col`}>{children}</div>
          </div>
        </motion.div>
      </FocusTrap>
    </>
  );

  return createPortal(content, document.body);
}
