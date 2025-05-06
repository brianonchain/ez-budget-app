import { useState, useRef } from "react";
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import Accordion from "./Accordion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label: string;
  _id: string;
  isError?: boolean;
  errorMsg?: string;
  tooltip?: boolean;
}

export default function InputPassword({ className = "", label, _id, isError = false, errorMsg = "", tooltip, ...props }: InputProps) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [show, setShow] = useState(false);

  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <label className="inputLabel" htmlFor={_id}>
        {label}
      </label>
      <div className="w-full relative">
        <input
          id={_id}
          className={`input ${isError ? "borderColorError" : ""} peer`}
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
          {show ? <PiEyeLight className="text-3xl desktop:text-[1.4rem]" /> : <PiEyeSlashLight className="text-3xl desktop:text-[1.4rem]" />}
        </button>
        {tooltip && !isError && (
          <div className="opacity-0 peer-focus:opacity-100 pointer-events-none absolute right-0 bottom-[calc(100%+8px)] px-3 py-2 desktop:px-2 desktop:py-1 bg-slate-800 text-white text-base desktop:text-xs space-y-[8px] rounded-lg [transition:opacity_300ms]">
            <p>&bull;&nbsp; min 8 characters</p>
            <p>&bull;&nbsp; have a lowercase letter</p>
            <p>&bull;&nbsp; have an uppercase letter</p>
            <p>&bull;&nbsp; have a number</p>
          </div>
        )}
      </div>
      <Accordion isOpen={isError ? true : false}>
        <p className="errorText">{errorMsg}</p>
      </Accordion>
    </div>
  );
}
