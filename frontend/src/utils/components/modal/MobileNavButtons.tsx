import { FiChevronLeft, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

const color = "bg-card dark:bg-buttonOutlineBgHover border border-buttonOutlineBorder";
const buttonBase = `absolute z-[120] top-[calc(env(safe-area-inset-top)+var(--modalNavButtonOffset))] rounded-full items-center justify-center ${color}`;
const buttonSize = "size-(--modalNavButtonSize)";
const iconSize = "size-(--modalNavIconSize)";
const leftPosition = "left-(--modalNavButtonOffset)";
const rightPosition = "right-(--modalNavButtonOffset)";

const buttonWhileTap = {
  scale: 1.3,
  backgroundColor: "var(--color-activeBackBg)",
  transition: { type: "spring", bounce: 0, duration: 0.3 },
} as const;

const mobileVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.2, duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, transition: { delay: 0.1, duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
} as const;

export default function MobileNavButtons({
  onClose,
  onBack,
  isPresent,
  disabled = false,
  innerBackdrop = false,
}: {
  onClose: () => void;
  onBack?: () => void;
  isPresent: boolean;
  disabled?: boolean;
  innerBackdrop?: boolean; // used to drop z-index if inner backdrop (z-100) exists (for inner modal & calendar)
}) {
  return (
    <>
      {!innerBackdrop && (
        <motion.button
          className={`${buttonBase} ${buttonSize} ${leftPosition} tablet:hidden flex backdrop-blur-xs`}
          onClick={onBack ?? onClose}
          type="button"
          disabled={disabled}
          aria-label={onBack ? "Back" : "Close"}
          // animation
          inherit={false}
          whileTap={buttonWhileTap}
          variants={mobileVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <FiChevronLeft className={`${iconSize} -translate-x-0.5`} />
        </motion.button>
      )}

      {/* CLOSE (appears if prev page exists) */}
      <AnimatePresence>
        {onBack && isPresent && !innerBackdrop && (
          <motion.button
            className={`${buttonBase} ${buttonSize} ${rightPosition} tablet:hidden flex backdrop-blur-xs`}
            onClick={onClose}
            type="button"
            disabled={disabled}
            aria-label="Close"
            // animation
            inherit={false}
            whileTap={buttonWhileTap}
            variants={mobileVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FiX className={iconSize} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
