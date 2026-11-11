"use client";
import { useState, useContext, createContext, useId, type Dispatch, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
// components
import ContentContainer from "./ContentContainer";
import ModalHeader from "./ModalHeader";
import ModalGlow from "./ModalGlow";
import DesktopNavButtons from "./DesktopNavButtons";
import Backdrop from "./Backdrop";
import InnerBackdrop from "./InnerBackdrop";
import FocusTrap from "./FocusTrap";
import TopBlur from "@/utils/components/modal/TopBlur";
import MobileNavButtons from "./MobileNavButtons";
// utils
import { useMediaQuery } from "@/utils/hooks";
import { TABLET_MQ } from "@/utils/constants";
import { desktopModalTransition, mobileModalTransition } from "@/utils/motions";

// React context for innerBackdrop state
const InnerBackdropContext = createContext<Dispatch<SetStateAction<boolean>> | null>(null);
export function useInnerBackdrop() {
  const setInnerBackdrop = useContext(InnerBackdropContext);
  if (!setInnerBackdrop) throw new Error("useInnerBackdrop must be used inside Modal");
  return setInnerBackdrop;
}

export default function Modal({
  children,
  title,
  onClose,
  disabled = false,
  maxWidth = "tablet:max-w-130 desktop:max-w-110",
  // multipage modal
  pageKey,
  direction = 1,
  onBack,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
  disabled?: boolean;
  maxWidth?: string;
  // multipage modal
  pageKey?: string;
  direction?: 1 | -1; // 1=forward, -1=back
  onBack?: () => void | undefined;
}) {
  // states
  const [innerBackdrop, setInnerBackdrop] = useState(false);

  // hooks
  const id = useId();
  const isTablet = useMediaQuery(TABLET_MQ);
  const isPresent = useIsPresent();

  // computed
  const modalWidth = `tablet:w-[90%] ${maxWidth}`;
  const titleId = `${id}-${pageKey ?? "page"}`;

  // content
  const content = (
    <>
      <FocusTrap>
        {/*--- FOCUS TRAP CONTAINER (also need to redeclare "app") ---*/}
        <div className="app textBase" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          {/*--- inner modal is portaled to body, z-120 ---*/}
          {/*--- mobile nav buttons, z-120 ---*/}
          <MobileNavButtons onClose={onClose} disabled={disabled} onBack={onBack} isPresent={isPresent} innerBackdrop={innerBackdrop} />
          {/*--- shell, z-110 ---*/}
          <AnimatePresence custom={{ direction, isPresent }}>
            {isPresent && (
              <motion.div
                key={pageKey}
                className={`fixed z-[110] inset-0 tablet:inset-auto tablet:left-1/2 tablet:top-1/2 tablet:-translate-x-1/2 tablet:-translate-y-1/2 ${modalWidth} tablet:max-h-[90dvh] flex flex-col tablet:roundedModal overflow-hidden modalColor ${innerBackdrop ? "tablet:border-none desktop:border-none" : ""}`}
                // animations
                // <AnimatePresence custom={direction}> => provides latest direction to exiting page
                // <motion.div custom={direction}> => provides direction to current/entering page
                custom={{ direction, isPresent }}
                variants={
                  isTablet
                    ? {
                        initial: { opacity: 0, scale: 0.95 },
                        animate: { opacity: 1, scale: 1 },
                        exit: { opacity: 0, scale: 0.95 },
                      }
                    : {
                        initial: ({ direction }) => ({
                          x: direction === -1 ? "-30%" : "100%",
                          zIndex: direction === -1 ? 110 : 111,
                        }),
                        animate: ({ direction }) => ({ x: 0, zIndex: direction === -1 ? 110 : 111 }),
                        exit: ({ direction, isPresent }) => ({
                          x: !isPresent ? "100%" : direction === -1 ? "100%" : "-30%",
                          zIndex: direction === -1 ? 111 : 110,
                        }),
                      }
                }
                initial="initial"
                animate="animate"
                exit="exit"
                transition={isTablet ? desktopModalTransition : mobileModalTransition}
              >
                {/*--- inner backdrop, z-110-100 ---*/}
                <AnimatePresence>{innerBackdrop && <InnerBackdrop />}</AnimatePresence>
                {/*--- header, z-110-90 ---*/}
                <ModalHeader titleId={titleId} title={title} />
                {/*--- desktop nav buttons, z: 110-90 ---*/}
                <DesktopNavButtons onClose={onClose} disabled={disabled} onBack={onBack} />
                {/*--- top blur, z-110-80 ---*/}
                <TopBlur />
                {/*--- content, z-110-10 ---*/}
                <ContentContainer>
                  <InnerBackdropContext.Provider value={setInnerBackdrop}>{children}</InnerBackdropContext.Provider>
                </ContentContainer>
                {/*--- glow, z-110-0 ---*/}
                <ModalGlow />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FocusTrap>
      {/*--- backdrop, z-100 ---*/}
      <Backdrop />
    </>
  );

  return createPortal(content, document.body);
}
