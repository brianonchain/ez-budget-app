// ModalFlow.tsx
"use client";

import { useId, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiX } from "react-icons/fi";
import { FocusTrap } from "focus-trap-react";
import { motion } from "framer-motion";
import ModalGlow from "./ModalGlow";
import { DESKTOP_MQ } from "@/utils/constants";

export default function ModalFlow({
  children,
  title,
  onClose,
  onBack,
  disabled = false,
  desktopWidth = "",
  contentMaxWidth = "",
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
  onBack?: () => void;
  disabled?: boolean;
  desktopWidth?: string;
  contentMaxWidth?: string;
}) {
  const titleId = useId();
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== "undefined" ? window.matchMedia(DESKTOP_MQ).matches : false));

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
      {/* one persistent backdrop for the whole flow */}
      <motion.div
        className="hidden desktop:block z-[100] fixed inset-0 bg-black/50 backdrop-blur-xs"
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
          initial={isDesktop ? { opacity: 0, scale: 0.98, y: 8 } : false}
          animate={isDesktop ? { opacity: 1, scale: 1, y: 0 } : undefined}
          exit={isDesktop ? { opacity: 0, scale: 0.98, y: 8 } : undefined}
          transition={{
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <ModalGlow />

          <h2 id={titleId} className="text-center textXl font-semibold mx-16 tablet:mx-21 desktop:mx-16 py-6 tablet:py-7 desktop:py-5">
            {title}
          </h2>

          <button
            className="absolute left-0 top-0 w-16 h-19 flex items-center justify-center tablet:hidden"
            onClick={onBack ?? onClose}
            type="button"
            disabled={disabled}
          >
            <FiChevronLeft className="size-[2.2rem]" />
          </button>

          {onBack && (
            <button
              className="absolute right-0 top-0 w-16 h-19 flex items-center justify-center tablet:hidden"
              onClick={onClose}
              type="button"
              disabled={disabled}
            >
              <FiX className="size-[2.2rem]" />
            </button>
          )}

          {onBack && (
            <button
              className="absolute left-0 top-0 size-16 desktop:size-13 hidden tablet:flex items-center justify-center rounded-br-2xl rounded-tl-2xl hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover"
              onClick={onBack}
              type="button"
              disabled={disabled}
            >
              <FiChevronLeft className="size-[1.7rem]" />
            </button>
          )}

          <button
            className="absolute right-0 top-0 size-16 desktop:size-13 hidden tablet:flex items-center justify-center rounded-bl-2xl hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover"
            onClick={onClose}
            type="button"
            disabled={disabled}
          >
            <FiX className="size-[1.7rem]" />
          </button>

          <div className="flex-1 min-h-0 overflow-hidden pt-6 desktop:pt-2 pb-12 desktop:pb-8 px-4 tablet:px-8 desktop:px-10 w-full">
            <div className={`relative mx-auto w-full max-w-100 ${contentMaxWidth} desktop:max-w-none h-full`}>{children}</div>
          </div>
        </motion.div>
      </FocusTrap>
    </>
  );

  return createPortal(content, document.body);
}
