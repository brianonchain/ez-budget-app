export default function Toggle({ ariaLabel, checked, onClick }: { ariaLabel: string; checked: boolean | undefined; onClick?: any }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className="w-[56px] h-[30px] desktop:w-[46px] desktop:h-[25px] flex items-center relative cursor-pointer"
      onClick={onClick}
    >
      <input readOnly={true} type="checkbox" checked={checked} className="sr-only peer" />
      <div className="w-full h-full bg-slate-300 peer-checked:bg-buttonPrimaryBg rounded-full"></div>
      <div className="w-[25px] h-[25px] desktop:w-[21px] desktop:h-[21px] absolute left-[3px] desktop:left-[2px] peer-checked:translate-x-full rounded-full bg-white transition-all pointer-events-none"></div>
    </button>
  );
}
