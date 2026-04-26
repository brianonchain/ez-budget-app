// ModalFlowPage.tsx
"use client";

import { motion } from "framer-motion";
import type { Direction } from "@/utils/types";

const mobileVariants = {
  initial: (direction: Direction) => ({
    x: direction === -1 ? "-30%" : "100%",
    zIndex: direction === -1 ? 110 : 112,
  }),
  animate: (direction: Direction) => ({
    x: 0,
    zIndex: direction === -1 ? 110 : 112,
  }),
  exit: (direction: Direction) => ({
    x: direction === 1 ? "-30%" : "100%",
    zIndex: direction === -1 ? 112 : 110,
  }),
};

export default function ModalFlowPage({ children, direction }: { children: React.ReactNode; direction: Direction }) {
  console.log("ModalFlowPage.tsx, direction", direction);
  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto thinScroll"
      custom={direction}
      variants={mobileVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 0.42,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      <div className="flex flex-col">{children}</div>
    </motion.div>
  );
}
