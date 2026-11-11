import { motion } from "framer-motion";
import { desktopModalTransition } from "@/utils/motions";

export default function Backdrop({
  isSimpleModal = false,
  isSidebarModal = false,
  onClose,
}: {
  isSimpleModal?: boolean;
  isSidebarModal?: boolean;
  onClose?: () => void;
}) {
  return (
    <motion.div
      className={`${isSimpleModal || isSidebarModal ? "" : "hidden tablet:block"} fixed z-[100] inset-0 bg-black/60 ${isSidebarModal ? "" : "backdrop-blur-xs"}`}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={desktopModalTransition}
      aria-hidden
      data-allow-click={isSidebarModal ? "true" : "false"}
    />
  );
}
