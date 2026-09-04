import { FiChevronLeft, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

const color = "bg-transparent hover:bg-buttonOutlineBgHover [transition:background-color_300ms]";
const buttonBase = `hidden tablet:flex absolute z-[90] top-(--modalNavButtonOffset) rounded-full items-center justify-center ${color}`;
const buttonSize = "size-(--modalNavButtonSize)";
const iconSize = "size-(--modalNavIconSize)";
const leftPosition = "left-(--modalNavButtonOffset)";
const rightPosition = "right-(--modalNavButtonOffset)";

const buttonWhileTap = {
  scale: 1.2,
  backgroundColor: "var(--color-activeBackBg)",
  transition: { type: "spring", bounce: 0, duration: 0.3 },
} as const;

export default function NavButtons({ onClose, onBack, disabled }: { onClose: () => void; onBack?: () => void; disabled?: boolean }) {
  // need 2 sets of buttons because mobile vs. desktop buttons have different functions and positions
  return (
    <>
      {/*--- BACK (only shows if prev page) ---*/}
      {onBack && (
        <motion.button
          className={`${buttonBase} ${buttonSize} ${leftPosition}`}
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
        className={`${buttonBase} ${buttonSize} ${rightPosition}`}
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
