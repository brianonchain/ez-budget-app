import { useState } from "react";
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import Accordion from "./Accordion";
import Input from "./Input";

type InputProps = {
  _id: string;
  label?: string;
  isError?: boolean;
  errorMsg?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputPassword({
  _id,
  label = "Password",
  isError = false,
  errorMsg = "Invalid password",
  className = "",
  ...props
}: InputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <label className="inputLabel" htmlFor={_id}>
        {label}
      </label>
      <div className="w-full relative">
        <Input
          id={_id}
          className={`!pr-[calc(1.2em+2rem)] desktop:!pr-[calc(1.2em+1.5rem)] ${
            isError ? "!border-buttonDangerBg focus:!border-buttonDangerBg" : ""
          } peer`}
          type={show ? "text" : "password"}
          autoCapitalize="none"
          autoCorrect="off"
          {...props}
        />
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 mr-[0.8em] rounded-md text-slate-400 peer-focus:text-slate-600 dark:text-slate-600 dark:peer-focus:text-slate-400 [transition:color_500ms]"
          onClick={() => setShow((prev) => !prev)}
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <PiEyeLight className="text-[2rem] desktop:text-[1.5rem]" />
          ) : (
            <PiEyeSlashLight className="text-[2rem] desktop:text-[1.5rem]" />
          )}
        </button>
      </div>
      <Accordion isOpen={isError ? true : false}>
        <p className="errorText">{errorMsg}</p>
      </Accordion>
    </div>
  );
}
