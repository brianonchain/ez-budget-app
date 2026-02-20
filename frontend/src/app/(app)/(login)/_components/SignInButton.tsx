import Image from "next/image";
import { ImSpinner2 } from "react-icons/im";

export default function SignInGoogle({
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
    <button
      onClick={onClick}
      className="w-full h-[3.5em] flex items-center justify-center gap-[12px] textBaseApp font-medium bg-white dark:bg-transparent dark:hover:bg-slate-300/20 border-[1.5px] border-slate-200 hover:border-slate-300 dark:border-slate-400 dark:hover:border-slate-400 rounded-full [transition:background-color_200ms] cursor-pointer"
    >
      <div className="w-7 h-7 desktop:w-5 desktotp:h-5 relative">
        <Image src={imageSrc} alt={imageAlt} fill />
      </div>
      <div className="relative">
        {label}
        {isLoading && (
          <ImSpinner2 className="absolute left-[calc(100%+12px)] desktop:left-[calc(100%+16px)] top-1/2 -translate-y-1/2 animate-spin text-[32px] desktop:text-[24px] text-slate-400" />
        )}
      </div>
    </button>
  );
}
