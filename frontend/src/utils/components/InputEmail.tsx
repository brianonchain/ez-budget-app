import Accordion from "./Accordion";
import Input from "./Input";

type InputProps = {
  _id: string;
  isSignIn?: boolean;
  label?: string;
  isError?: boolean;
  errorMsg?: string;
  inputSize?: "xs" | "sm" | "base" | "login";
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputEmail({
  _id,
  isSignIn = false,
  label = "Email",
  isError = false,
  errorMsg = "Invalid email",
  inputSize = "base",
  ...props
}: InputProps) {
  // TODO: remove items-start on top level?
  return (
    <div className="flex flex-col items-start">
      <label className={`inputLabel ${inputSize === "login" ? "textSm text-textSecondary !pb-1.5" : ""}`} htmlFor={_id}>
        {label}
      </label>
      <Input
        className={`w-full ${isError ? "!border-buttonDangerBg focus:!border-buttonDangerBg" : ""}`}
        variant="primary"
        inputSize={inputSize}
        // props specific for InputEmail
        id={_id}
        name={isSignIn ? "username" : "email"}
        autoComplete={isSignIn ? "username" : "email"}
        type="email"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="email"
        // rest of props
        {...props}
      />
      <Accordion isOpen={isError}>
        <p className="mt-1 text-textDanger">{errorMsg}</p>
      </Accordion>
    </div>
  );
}
