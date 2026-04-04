import { useState } from "react";
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import Accordion from "./Accordion";
import Input from "./Input";

type InputProps = {
  inputSize: "xs" | "sm" | "base" | "login";
  _id: string;
  isCurrentPassword: boolean; // true for sign in form and "current password" field in change password form
  name: string;
  // name should be:
  // sing in form = "password"
  // sign up form = "password", "confirmPassword"
  // change password form = "currentPassword", "newPassword", "confirmNewPassword"
  label: string;
  isError?: boolean;
  errorMsg?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputPassword({
  inputSize,
  _id,
  isCurrentPassword,
  name,
  label,
  isError = false,
  errorMsg = "Invalid password",
  ...props
}: InputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col items-start">
      <label className={`inputLabel ${inputSize === "login" ? "textSm text-textSecondary !pb-1.5" : ""}`} htmlFor={_id}>
        {label}
      </label>
      <div className="w-full relative">
        <Input
          className={`!pr-[calc(1.2em+2rem)] desktop:!pr-[calc(1.2em+1.5rem)] ${
            isError ? "!border-buttonDangerBg focus:!border-buttonDangerBg" : ""
          } peer`}
          variant="primary"
          inputSize={inputSize}
          // props specific for InputPassword
          id={_id}
          name={name}
          autoComplete={isCurrentPassword ? "current-password" : "new-password"}
          type={show ? "text" : "password"}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
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
        <p className="mt-1 text-textDanger">{errorMsg}</p>
      </Accordion>
    </div>
  );
}
