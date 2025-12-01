import Image from "next/image";

export default function SignInGoogle({ label, imageSrc, imageAlt, onClick }: { label: string; imageSrc: string; imageAlt: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-[3.2em] flex items-center justify-center gap-4 textBaseApp font-medium bg-transparent hover:bg-slate-200 dark:hover:bg-slate-300/20 border-[1.5px] border-slate-300 dark:border-slate-400 rounded-full [transition:background-color_300ms] cursor-pointer"
    >
      <div className="w-7 h-7 desktop:w-5 desktotp:h-5 relative">
        <Image src={imageSrc} alt={imageAlt} fill />
      </div>
      <p>{label}</p>
    </button>
  );
}
