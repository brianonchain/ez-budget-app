"use client";
import { useState, useContext, createContext, type Dispatch, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
// components
import ModalGlow from "./ModalGlow";
import NavButtons from "./NavButtons";
import Backdrop from "./Backdrop";
import InnerBackdrop from "./InnerBackdrop";
import FocusTrap from "./FocusTrap";
import TopBlur from "@/utils/components/TopBlur";
// utils
import { useMediaQuery } from "@/utils/hooks";
import { TABLET_MQ } from "@/utils/constants";
import type { Direction } from "@/utils/types";
import { desktopModalTransition, mobileModalTransition } from "@/utils/motions";

// React context for innerBackdrop state
const InnerBackdropContext = createContext<Dispatch<SetStateAction<boolean>> | null>(null);
export function useInnerBackdrop() {
  const setInnerBackdrop = useContext(InnerBackdropContext);
  if (!setInnerBackdrop) throw new Error("useInnerBackdrop must be used inside Modal");
  return setInnerBackdrop;
}

const modalWidth = "tablet:w-[90%] tablet:max-w-130 desktop:max-w-110";
const modalHeight = "tablet:max-h-[90dvh]";
const modalPadding = "px-4 tablet:px-12 desktop:px-10 pt-[calc(env(safe-area-inset-top)+5rem)] pb-12 tablet:pb-9 desktop:pb-7"; // container has tablet:pb-3

export default function ModalNew({
  children,
  title,
  onClose,
  disabled = false,
  // multipage modal
  pageKey,
  direction = 0,
  onBack,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
  disabled?: boolean;
  // multipage modal
  pageKey?: string;
  direction?: Direction;
  onBack?: () => void;
}) {
  const [innerBackdrop, setInnerBackdrop] = useState(false);
  const isTablet = useMediaQuery(TABLET_MQ);

  // modal shell: mobile - animates on open/close, no animation on changing content; tablet/desktop - animates on open/close & changing content
  // content shell: mobile - no animate on open/close, animates on changing content; 2) tablet/desktop - no animation
  // nav buttons: mobile - animates on open/close, no animation on changin content; 2) tablet/desktop - no animation
  // any key change will cause element to remount and, thus, reanimate

  const content = (
    <>
      {/*--- backdrop, body z-100 ---*/}
      <Backdrop />
      <FocusTrap>
        {/*--- modal shell, body z-110 ---*/}
        <AnimatePresence propagate>
          <motion.div
            key={isTablet ? pageKey : undefined}
            className={`app textBase z-[110] fixed inset-0 tablet:inset-auto tablet:left-1/2 tablet:top-1/2 tablet:-translate-x-1/2 tablet:-translate-y-1/2 ${modalWidth} ${modalHeight} flex flex-col tablet:roundedModal overflow-hidden`}
            role="dialog"
            aria-modal="true"
            // animations
            variants={
              isTablet
                ? {
                    initial: { opacity: 0, scale: 0.95 },
                    animate: { opacity: 1, scale: 1 },
                    exit: { opacity: 0, scale: 0.95 },
                  }
                : { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
            }
            initial="initial"
            animate="animate"
            exit="exit"
            transition={isTablet ? desktopModalTransition : mobileModalTransition}
          >
            {/*--- MODAL CONTENT, z: 110-0, mode="sync" beacuse you want old/new content to slide simultaneously ---*/}
            <AnimatePresence initial={false} custom={direction} mode="sync">
              <motion.div
                key={isTablet ? undefined : pageKey}
                className={`${isTablet ? "relative min-h-0" : "absolute inset-0"} z-[0] tablet:py-3 flex flex-col w-full overflow-hidden modalColor tablet:roundedModal`}
                // animations
                // <AnimatePresence custom={direction}> => provides latest direction to exiting page
                // <motion.div custom={direction}> => provides direction to current/entering page
                custom={direction}
                inherit={false}
                variants={
                  isTablet
                    ? undefined
                    : {
                        initial: (direction: Direction) => ({
                          x: direction === -1 ? "-30%" : "100%",
                          zIndex: direction === -1 ? 0 : 1,
                        }),
                        animate: (direction: Direction) => ({ x: 0, zIndex: direction === -1 ? 0 : 1 }),
                        exit: (direction: Direction) => ({ x: direction === 1 ? "-30%" : "100%", zIndex: direction === -1 ? 1 : 0 }),
                      }
                }
                initial={isTablet ? false : "initial"}
                animate={isTablet ? undefined : "animate"}
                exit={isTablet ? undefined : "exit"}
                transition={isTablet ? undefined : mobileModalTransition}
              >
                {/*--- glow, z: 110-0-0 ---*/}
                <ModalGlow />
                {/*--- content, z: 110-0-10 ---*/}
                <div
                  className={`relative z-[10] flex-1 min-h-0 overflow-y-auto overscroll-contain ${modalPadding} w-full tablet:thinScroll topFade modalScroll`}
                >
                  <div className={`mx-auto w-full max-w-100 tablet:max-w-none flex flex-col`}>
                    <InnerBackdropContext.Provider value={setInnerBackdrop}>{children}</InnerBackdropContext.Provider>
                  </div>
                </div>
                {/*--- top blur, z: 110-0-50 ---*/}
                {/* <TopBlur /> */}
                {/*--- header, z: 110-0-60 ---*/}
                <h2 className="absolute z-[60] top-[calc(env(safe-area-inset-top)+0.75rem)] inset-x-0 mx-16 tablet:mx-21 desktop:mx-16 h-11 tablet:h-12 desktop:h-11 flex items-center justify-center text-center textXl font-semibold pointer-events-none">
                  {title}
                </h2>
              </motion.div>
            </AnimatePresence>
            {/*--- NAV BUTTONS, z: 110-10 ---*/}
            <NavButtons onClose={onClose} disabled={disabled} onBack={onBack} />
            {/*--- inner backdrop, z: 110-20 ---*/}
            <AnimatePresence>{innerBackdrop && <InnerBackdrop />}</AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </FocusTrap>
    </>
  );

  return createPortal(content, document.body);
}
