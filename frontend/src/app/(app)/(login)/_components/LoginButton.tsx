import Image from "next/image";
import { ImSpinner2 } from "react-icons/im";

export default function LoginButton({
  isLoading,
  label,
  imageSrc,
  imageAlt,
  onClick,
}: {
  isLoading: boolean;
  label: string;
  imageSrc: string;
  imageAlt: string;
  onClick: () => void;
}) {
  return (
    <button className="relative loginButtonBase loginButtonRoundness loginButtonColor" onClick={onClick} type="button">
      <div className="relative w-7 h-7 desktop:w-5 desktotp:h-5">
        <Image src={imageSrc} alt={imageAlt} fill />
      </div>
      <div className="relative">{label}</div>
      {isLoading && (
        <ImSpinner2 className="absolute right-7 desktop:right-6 top-1/2 -translate-y-1/2 animate-spin text-3xl desktop:text-2xl text-slate-400" />
      )}
    </button>
  );
}
