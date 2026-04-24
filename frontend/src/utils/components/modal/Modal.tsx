"use client";
import { useId, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiX } from "react-icons/fi";
import { FocusTrap } from "focus-trap-react";
import { motion } from "framer-motion";
import ModalGlow from "./ModalGlow";
import { DESKTOP_MQ } from "@/utils/constants";
import type { Direction } from "@/utils/types";

const desktopVariants = {
  initial: { opacity: 0, scale: 0.98, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 8 },
};
const mobileVariants = {
  initial: (direction: Direction) => ({ x: direction === -1 ? "-30%" : "100%", zIndex: direction === -1 ? 110 : 112 }),
  animate: (direction: Direction) => ({ x: 0, zIndex: direction === -1 ? 110 : 112 }),
  exit: (direction: Direction) => ({
    x: direction === 0 ? "100%" : direction === 1 ? "-30%" : "100%",
    zIndex: direction === -1 ? 112 : 110,
  }),
};

// mobile/tablet = FULL SCREEN, desktop = MODAL
export default function Modal({
  children,
  title,
  onClose,
  disabled = false,
  desktopWidth = "",
  contentMaxWidth = "",
  // multipage modal props
  direction = 0,
  onBack,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
  disabled?: boolean;
  desktopWidth?: string;
  contentMaxWidth?: string;
  // multipage modal props
  direction?: Direction;
  onBack?: (() => void) | undefined;
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
      {/*--- backdrop ---*/}
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
          className={`app textBase fixed z-[110] inset-0 desktop:inset-auto desktop:left-1/2 desktop:top-1/2 desktop:-translate-x-1/2 desktop:-translate-y-1/2 w-full h-[100dvh] desktop:w-[90%] desktop:max-w-104 ${desktopWidth} desktop:pb-3 desktop:h-auto desktop:max-h-[90dvh] desktop:rounded-2xl flex flex-col overflow-hidden modalColor`}
          variants={isDesktop ? desktopVariants : mobileVariants}
          custom={direction}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: isDesktop ? 0.2 : 0.32,
            ease: [0.22, 1, 0.36, 1],
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <ModalGlow />

          {/*--- HEADER ---*/}
          <h2 id={titleId} className="text-center textXl font-semibold mx-16 tablet:mx-21 desktop:mx-16 py-6 tablet:py-7 desktop:py-5">
            {title}
          </h2>
          {/*--- mobile nav buttons (x button is optional) ---*/}
          <button
            className="absolute left-0 top-0 w-16 h-19 flex items-center justify-center tablet:hidden"
            onClick={onBack ?? onClose}
            type="button"
            disabled={disabled}
          >
            <FiChevronLeft className="text-[2.2rem]" />
          </button>
          {onBack && (
            <button
              className="absolute right-0 top-0 w-16 h-19 flex items-center justify-center tablet:hidden"
              onClick={onClose}
              type="button"
              disabled={disabled}
            >
              <FiX className="text-[2.2rem]" />
            </button>
          )}
          {/*--- tablet/desktop nav buttons (back button is optional) ---*/}
          {onBack && (
            <button
              className={`absolute left-0 top-0 aspect-square w-16 desktop:w-13 hidden tablet:flex items-center justify-center rounded-br-2xl rounded-tl-2xl desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover text-[2rem] desktop:text-[1.5rem] font-medium`}
              onClick={onBack}
              type="button"
              disabled={disabled}
            >
              <FiChevronLeft className="text-[1.7rem]" />
            </button>
          )}
          <button
            className={`absolute right-0 top-0 aspect-square w-16 desktop:w-13 hidden tablet:flex items-center justify-center rounded-bl-2xl desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover text-[2rem] desktop:text-[1.5rem] font-medium`}
            onClick={onClose}
            type="button"
            disabled={disabled}
          >
            <FiX className="text-[1.7rem]" />
          </button>

          {/*--- CONTENT ---*/}
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
