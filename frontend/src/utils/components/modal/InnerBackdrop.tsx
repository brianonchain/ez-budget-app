import { motion } from "framer-motion";
import { desktopModalTransition } from "@/utils/motions";

export default function InnerBackdrop() {
  return (
    <motion.div
      className="absolute inset-0 z-[20] bg-black/50 backdrop-blur-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={desktopModalTransition}
      aria-hidden
    />
  );
}
