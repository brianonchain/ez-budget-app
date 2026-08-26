"use client";
import { createPortal } from "react-dom";
import { FocusTrap } from "focus-trap-react";
import { motion } from "framer-motion";
import Backdrop from "@/utils/components/modal/Backdrop";
import SimpleModalGlow from "@/utils/components/simpleModal/SimpleModalGlow";
import { desktopModalTransition } from "@/utils/motions";

export default function SimpleModal({
  children,
  ariaLabel,
  isInnerModal = false,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  isInnerModal?: boolean;
}) {
  const content = (
    <>
      {!isInnerModal && <Backdrop />}
      <FocusTrap focusTrapOptions={{ initialFocus: false }}>
        <motion.div
          className={`app textBase z-[110] fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 py-3 w-[85%] tablet:w-106 desktop:w-90 max-h-[70dvh] rounded-2xl flex flex-col overflow-hidden ${isInnerModal ? "innerModalColor" : "modalColor"}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={desktopModalTransition}
          role="alertdialog"
          aria-modal="true"
          aria-label={ariaLabel}
        >
          <SimpleModalGlow />
          {/*--- content, z-10 ---*/}
          <div className="z-10 flex-1 min-h-0 py-3 tablet:py-5 desktop:py-7 px-6 tablet:px-8 desktop:px-10 overflow-y-auto tablet:thinScroll">
            <div className="flex flex-col items-center">{children}</div>
          </div>
        </motion.div>
      </FocusTrap>
    </>
  );

  return createPortal(content, document.body);
}
