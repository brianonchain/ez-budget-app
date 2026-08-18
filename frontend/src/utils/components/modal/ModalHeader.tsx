import { FiChevronLeft, FiX } from "react-icons/fi";

export default function ModalHeader({
  id,
  title,
  onBack,
  onClose,
  disabled,
}: {
  id: string;
  title: string;
  onBack?: () => void;
  onClose: () => void;
  disabled?: boolean;
}) {
  return (
    <>
      {/*--- HEADER ---*/}
      <h2 id={id} className="text-center textXl font-semibold mx-16 tablet:mx-21 desktop:mx-16 py-6 tablet:py-7 desktop:py-5">
        {title}
      </h2>
      {/*--- mobile nav buttons (x button only shown for multipage modals) ---*/}
      <button
        className="absolute left-0 top-0 w-16 h-19 flex items-center justify-center tablet:hidden"
        onClick={onBack ?? onClose}
        type="button"
        disabled={disabled}
      >
        <FiChevronLeft className="size-[2rem]" />
      </button>
      {onBack && (
        <button
          className="absolute right-0 top-0 w-16 h-19 flex items-center justify-center tablet:hidden"
          onClick={onClose}
          type="button"
          disabled={disabled}
        >
          <FiX className="size-[2rem]" />
        </button>
      )}
      {/*--- tablet/desktop nav buttons (back button only shown for multipage modals) ---*/}
      {onBack && (
        <button
          className={`absolute left-0 top-0 size-16 desktop:size-13 hidden tablet:flex items-center justify-center rounded-br-2xl rounded-tl-2xl hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover`}
          onClick={onBack}
          type="button"
          disabled={disabled}
        >
          <FiChevronLeft className="size-[2rem] desktop:size-[1.7rem]" />
        </button>
      )}
      <button
        className={`absolute right-1.5 top-1.5 size-15 desktop:size-11 hidden tablet:flex items-center justify-center rounded-full hover:bg-closeButtonBgHover active:bg-closeButtonBgHover transition-all duration-300`}
        onClick={onClose}
        type="button"
        disabled={disabled}
      >
        <FiX className="tablet:size-[2rem] desktop:size-[1.6rem]" />
      </button>
    </>
  );
}
