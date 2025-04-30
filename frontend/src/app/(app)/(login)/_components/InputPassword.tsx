import { useState, useRef } from "react";
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
  tooltip?: boolean;
}

export default function InputPassword({ label, tooltip, error = "", className = "", ...props }: InputProps) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [show, setShow] = useState(false);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="inputLabel">{label}</div>
      <div className="w-full relative">
        <input
          className={`input ${error ? "!border-red-500 !focus:border-red-500" : ""} peer`}
          ref={ref}
          type={show ? "text" : "password"}
          autoCapitalize="none"
          autoCorrect="off"
          {...props}
        ></input>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 flex desktop:cursor-pointer text-slate-400 peer-focus:text-slate-600 dark:text-slate-600 dark:peer-focus:text-slate-400 [transition:color_500ms]"
          type="button"
          onClick={() => {
            const el = ref.current;
            if (!el) return;
            setShow(!show);
            setTimeout(() => {
              el.focus();
              el.setSelectionRange(el.value.length, el.value.length);
            }, 0);
          }}
        >
          {show ? <PiEyeLight className="text-[28px] desktop:text-[22px]" /> : <PiEyeSlashLight className="text-[28px] desktop:text-[22px]" />}
        </button>
        {tooltip && !error && (
          <div className="opacity-0 peer-focus:opacity-100 pointer-events-none absolute right-0 bottom-[calc(100%+8px)] px-2 py-1 bg-slate-800 text-white text-xs space-y-[8px] rounded-[8px] [transition:opacity_300ms]">
            <p>&bull;&nbsp; min 8 characters</p>
            <p>&bull;&nbsp; have a lowercase letter</p>
            <p>&bull;&nbsp; have an uppercase letter</p>
            <p>&bull;&nbsp; have a number</p>
          </div>
        )}
        {error && <p className="absolute right-0 bottom-[calc(100%+6px)] max-w-[70%] px-[8px] py-[6px] bg-red-500 text-white text-xs space-y-[8px] rounded-[8px]">{error}</p>}
      </div>
    </div>
  );
}
