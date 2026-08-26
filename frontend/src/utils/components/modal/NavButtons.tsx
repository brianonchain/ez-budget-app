import { FiChevronLeft, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

const color =
  "border border-buttonOutlineBorder desktop:border-none bg-card dark:bg-buttonOutlineBgHover desktop:bg-transparent hover:bg-buttonOutlineBgHover";
const buttonBase = `absolute z-[10] rounded-full items-center justify-center ${color}`;
const buttonSize = "size-11 tablet:size-12 desktop:size-11";
const iconSize = "size-[2.2rem] tablet:size-[2rem] desktop:size-[1.6rem]";
const leftPosition = "left-4 top-[calc(env(safe-area-inset-top)+0.75rem)] tablet:top-4 desktop:left-2.5 desktop:top-2.5";
const rightPosition = "right-4 top-[calc(env(safe-area-inset-top)+0.75rem)] tablet:top-4 desktop:right-2.5 desktop:top-2.5";

const buttonWhileTap = {
  scale: 1.3,
  backgroundColor: "var(--color-activeBackBg)",
  transition: { type: "spring", bounce: 0, duration: 0.3 },
} as const;

const mobileVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.2, duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, transition: { delay: 0.1, duration: 0.3, ease: "easeOut" } },
} as const;

export default function NavButtons({ onClose, onBack, disabled }: { onClose: () => void; onBack?: () => void; disabled?: boolean }) {
  // need 2 sets of buttons because mobile vs. desktop buttons have different functions and positions
  return (
    <>
      {/*--- MOBILE ---*/}
      {/* BACK (always shown) */}
      <motion.button
        className={`${buttonBase} ${buttonSize} ${leftPosition} tablet:hidden flex backdrop-blur-sm`}
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
      {/* CLOSE (appears if prev page) */}
      <AnimatePresence>
        {onBack && (
          <motion.button
            className={`${buttonBase} ${buttonSize} ${rightPosition} tablet:hidden flex backdrop-blur-sm`}
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

      {/*--- TABLET / DESKTOP ---*/}
      {/*--- BACK (only shows if prev page) ---*/}
      {onBack && (
        <motion.button
          className={`${buttonBase} ${buttonSize} ${leftPosition} hidden tablet:flex`}
          onClick={onBack}
          type="button"
          disabled={disabled}
          aria-label="Back"
          inherit={false}
          whileTap={buttonWhileTap}
        >
          <FiChevronLeft className={`${iconSize} -translate-x-0.5`} />
        </motion.button>
      )}
      {/*--- CLOSE (always shown) ---*/}
      <motion.button
        className={`${buttonBase} ${buttonSize} ${rightPosition} hidden tablet:flex`}
        onClick={onClose}
        type="button"
        disabled={disabled}
        aria-label="Close"
        inherit={false}
        whileTap={buttonWhileTap}
      >
        <FiX className={iconSize} />
      </motion.button>
    </>
  );
}
