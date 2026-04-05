export default function Toggle({ ariaLabel, checked, onClick }: { ariaLabel: string; checked: boolean | undefined; onClick?: any }) {
  console.log("checked", checked);
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`relative w-[52px] h-[31px] desktop:w-[44px] desktop:h-[26px] rounded-full flex items-center ${
        checked ? "bg-buttonPrimaryBg" : "bg-slate-300"
      }`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      type="button"
    >
      <div
        className={`absolute left-[3px] aspect-square w-[25px] desktop:w-[20px] ${
          checked ? "translate-x-[21px] desktop:translate-x-[18px]" : ""
        } rounded-full bg-white transition-transform duration-200 ease-out will-change-transform pointer-events-none`}
        aria-hidden="true"
      />
    </button>
  );
}
