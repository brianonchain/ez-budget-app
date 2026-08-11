type ToggleProps = {
  checked: boolean | undefined;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

// required tokens: --color-toggleOn, --color-toggleOff
// required classes: none

export default function Toggle({ checked, className = "", ...props }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      type="button"
      className={`relative w-[52px] h-[31px] desktop:w-[44px] desktop:h-[26px] rounded-full flex items-center ${
        checked ? "bg-toggleOn" : "bg-toggleOff"
      } ${className}`}
      {...props}
    >
      <div
        className={`absolute left-[3px] size-[25px] desktop:size-[20px] ${
          checked ? "translate-x-[21px] desktop:translate-x-[18px]" : ""
        } rounded-full bg-white transition-transform duration-200 ease-out will-change-transform pointer-events-none`}
        aria-hidden="true"
      />
    </button>
  );
}

// translate-x value: width - xPadding * 2 - circleWidth
// mobile/tablet: 52px - 3px * 2 - 25px = 21px
// desktop: 44px - 3px * 2 - 20px = 18px
