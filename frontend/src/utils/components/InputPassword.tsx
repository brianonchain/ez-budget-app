import { useState, useId } from "react";
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import Accordion from "./Accordion";
import Input from "./Input";

// only 2 sizes: "login" or "base"

type InputProps = {
  isCurrentPassword: boolean; // true for  1) sign in form and 2) "current password" field in change password form
  name: string;
  // name should be:
  // "password" for login form
  // "password", "confirmPassword" for sign up form
  // "currentPassword", "newPassword", "confirmNewPassword" for change password form
  isLogin?: boolean; // is element used in login form?
  label?: string;
  isError?: boolean;
  errorMsg?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputPassword({
  isCurrentPassword,
  name,
  label,
  isLogin = false,
  isError = false,
  errorMsg = "Invalid password",
  ...props
}: InputProps) {
  const [show, setShow] = useState(false);
  const id = useId();

  // TODO: remove items-start on top level?
  return (
    <div className="flex flex-col items-start">
      {label && (
        <label className={`inputLabel ${isLogin ? "textSm !pb-1 font-medium text-textSecondary" : ""}`} htmlFor={id}>
          {label}
        </label>
      )}
      <div className="w-full relative">
        <Input
          {...props} // use "...props" first, so below will always override
          className={`w-full !pr-[calc(1.2em+2rem)] desktop:!pr-[calc(1.2em+1.5rem)] ${
            isError ? "!border-buttonDangerBg focus:!border-buttonDangerBg" : ""
          } peer`}
          variant={isLogin ? "login" : "primary"}
          inputSize={isLogin ? "login" : "base"}
          // specific props for InputPassword
          id={id}
          name={name}
          autoComplete={isCurrentPassword ? "current-password" : "new-password"}
          type={show ? "text" : "password"}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 mr-[0.8em] rounded-md text-slate-400 peer-focus:text-slate-600 dark:text-slate-600 dark:peer-focus:text-slate-400 [transition:color_500ms]"
          onClick={() => setShow((prev) => !prev)}
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <PiEyeLight className="size-[2rem] desktop:size-[1.5rem]" />
          ) : (
            <PiEyeSlashLight className="size-[2rem] desktop:size-[1.5rem]" />
          )}
        </button>
      </div>
      <Accordion isOpen={isError ? true : false}>
        <p className="mt-1 text-textDanger">{errorMsg}</p>
      </Accordion>
    </div>
  );
}
