import { motion } from "framer-motion";
import { createPortal } from "react-dom";

export default function Backdrop() {
  const content = (
    <motion.div
      className="hidden tablet:block z-[100] fixed inset-0 bg-black/70 backdrop-blur-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    />
  );
  return createPortal(content, document.body);
}
