import { FaChevronLeft } from "react-icons/fa6";
import { FiChevronLeft, FiX } from "react-icons/fi";

export default function ModalHeader({
  id,
  title,
  onClose,
  onBack,
  disabled,
  isSidebar = false,
}: {
  id: string;
  title: string;
  onClose: () => void;
  onBack?: (() => void) | undefined;
  disabled: boolean;
  isSidebar?: boolean;
}) {
  return (
    <>
      {/*--- title ---*/}
      <h2 id={id} className="text-center textXl font-semibold mx-16 tablet:mx-21 desktop:mx-16 py-6 tablet:py-7 desktop:py-5">
        {title}
      </h2>
      {/*--- mobile (x button is optional) ---*/}
      <button
        className="absolute left-0 top-0 w-16 h-19 flex items-center justify-center tablet:hidden"
        onClick={onBack ?? onClose}
        type="button"
        disabled={disabled}
      >
        <FiChevronLeft className="text-[2.2rem]" />
      </button>
      {onBack && (
        <button
          className="absolute right-0 top-0 w-16 h-19 flex items-center justify-center tablet:hidden"
          onClick={onClose}
          type="button"
          disabled={disabled}
        >
          <FiX className="text-[2.2rem]" />
        </button>
      )}
      {/*--- tablet/desktop (back button is optional) ---*/}
      {onBack && (
        <button
          className={`absolute left-0 top-0 aspect-square w-16 desktop:w-13 hidden tablet:flex items-center justify-center rounded-br-2xl rounded-tl-2xl desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover text-[2rem] desktop:text-[1.5rem] font-medium`}
          onClick={onBack}
          type="button"
          disabled={disabled}
        >
          <FiChevronLeft className="text-[1.7rem]" />
        </button>
      )}
      <button
        className={`absolute right-0 top-0 aspect-square w-16 desktop:w-13 hidden tablet:flex items-center justify-center rounded-bl-2xl ${
          isSidebar ? "" : "rounded-tr-2xl"
        } desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover text-[2rem] desktop:text-[1.5rem] font-medium`}
        onClick={onClose}
        type="button"
        disabled={disabled}
      >
        <FiX className="text-[1.7rem]" />
      </button>
    </>
  );
}
