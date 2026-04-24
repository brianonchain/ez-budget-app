"use client";
import { useId } from "react";
import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import ModalGlow from "./ModalGlow";
import ModalHeader from "./ModalHeader";
import ModalBody from "./ModalBody";

type Props = {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  disableClose?: boolean;
  contentMaxWidth?: string;
  children: React.ReactNode;
  /** Full Framer `animate` target for this layer (you control it from the parent). */
  animate: TargetAndTransition;
  transition: Transition;
  /** Optional class on the root motion layer (e.g. pointer-events-none when inactive). */
  rootClassName?: string;
};

export default function AnimatedModalPage({
  title,
  onClose,
  onBack,
  disableClose = false,
  contentMaxWidth = "",
  children,
  animate,
  transition,
  rootClassName = "",
}: Props) {
  const titleId = useId();

  return (
    <motion.div
      className={`absolute w-dvw h-dvh inset-0 desktop:static flex flex-col modalColor ${rootClassName}`.trim()}
      initial={false}
      animate={animate}
      transition={transition}
    >
      <ModalGlow />
      <ModalHeader id={titleId} title={title} onClose={onClose} onBack={onBack} disabled={disableClose} />
      <ModalBody contentMaxWidth={contentMaxWidth}>{children}</ModalBody>
    </motion.div>
  );
}
