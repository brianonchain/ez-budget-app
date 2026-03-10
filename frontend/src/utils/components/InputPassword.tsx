import { useState, useRef } from "react";
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import Accordion from "./Accordion";

type InputProps = {
  className?: string;
  label: string;
  _id: string;
  isError?: boolean;
  errorMsg?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputPassword({ className = "", label, _id, isError = false, errorMsg = "", ...props }: InputProps) {
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
          className={`input !pr-[calc(1.2em+2rem)] desktop:!pr-[calc(1.2em+1.5rem)] ${
            isError ? "!border-buttonRedBg focus:!border-buttonRedBg" : ""
          } peer`}
          ref={ref}
          type={show ? "text" : "password"}
          autoCapitalize="none"
          autoCorrect="off"
          {...props}
        ></input>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-[0.8em] flex items-center justify-center">
          <button
            className="desktop:cursor-pointer text-slate-400 peer-focus:text-slate-600 dark:text-slate-600 dark:peer-focus:text-slate-400 [transition:color_500ms]"
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
            {show ? (
              <PiEyeLight className="text-[2rem] desktop:text-[1.5rem]" />
            ) : (
              <PiEyeSlashLight className="text-[2rem] desktop:text-[1.5rem]" />
            )}
          </button>
        </div>
      </div>
      <Accordion isOpen={isError ? true : false}>
        <p className="errorText">{errorMsg}</p>
      </Accordion>
    </div>
  );
}
