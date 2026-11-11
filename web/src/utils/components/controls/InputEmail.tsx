import Accordion from "../Accordion";
import Input from "./Input";

type InputProps = {
  _id: string;
  isSignIn?: boolean;
  label?: string;
  isError?: boolean;
  errorMsg?: string;
  inputSize?: "xs" | "sm" | "default" | "login";
  inputVariant?: "default" | "login";
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputEmail({
  _id,
  isSignIn = false,
  label,
  isError = false,
  errorMsg = "Invalid email",
  inputSize = "default",
  inputVariant = "default",
  ...props
}: InputProps) {
  // TODO: remove items-start on top level?
  return (
    <div className="flex flex-col items-start">
      {label && (
        <label className={`inputLabel ${inputSize === "login" ? "textSm !pb-1 font-medium text-accent-foreground" : ""}`} htmlFor={_id}>
          {label}
        </label>
      )}
      <Input
        className="w-full"
        variant={inputVariant}
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
        <p className="mt-1 text-destructive">{errorMsg}</p>
      </Accordion>
    </div>
  );
}
