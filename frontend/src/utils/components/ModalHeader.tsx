import { FaAngleLeft } from "react-icons/fa6";

export default function ModalHeader({
  id,
  title,
  onClose,
  disabled,
  isSidebar = false,
}: {
  id: string;
  title: string;
  onClose: () => void;
  disabled: boolean;
  isSidebar?: boolean;
}) {
  return (
    <>
      {/*--- title ---*/}
      <h2 id={id} className="text-center textXl font-semibold mx-16 tablet:mx-21 desktop:mx-16 py-6 tablet:py-7 desktop:py-5">
        {title}
      </h2>
      {/*--- mobile back ---*/}
      <button className="absolute left-[12px] top-[18px] p-2 tablet:hidden" onClick={onClose} type="button" disabled={disabled}>
        <FaAngleLeft className="text-[1.6rem]" />
      </button>
      {/*--- tablet/desktop close ---*/}
      <button
        className={`absolute right-0 top-0 aspect-square w-16 desktop:w-13 hidden tablet:flex items-center justify-center rounded-bl-2xl ${
          isSidebar ? "" : "rounded-tr-2xl"
        } desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover text-[2rem] desktop:text-[1.5rem] font-medium`}
        onClick={onClose}
        type="button"
        disabled={disabled}
      >
        &#10005;
      </button>
    </>
  );
}
