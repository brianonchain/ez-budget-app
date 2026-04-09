type ToggleProps = {
  checked: boolean | undefined;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Toggle({ checked, className = "", ...props }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      type="button"
      className={`relative w-[52px] h-[31px] desktop:w-[44px] desktop:h-[26px] rounded-full flex items-center ${
        checked ? "bg-buttonPrimaryBg" : "bg-textTertiary"
      } ${className}`}
      {...props}
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
