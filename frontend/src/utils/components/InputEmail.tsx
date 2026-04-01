import Accordion from "./Accordion";
import Input from "./Input";

type InputProps = {
  _id: string;
  label?: string;
  isError?: boolean;
  errorMsg?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputEmail({
  _id,
  label = "Email",
  isError = false,
  errorMsg = "Invalid email",
  className = "",
  ...props
}: InputProps) {
  return (
    <div className={`flex flex-col items-start ${className}`}>
      <label className="inputLabel" htmlFor={_id}>
        {label}
      </label>
      <Input
        className={isError ? "!border-buttonDangerBg focus:!border-buttonDangerBg" : ""}
        id={_id} // reusable components shouldn't hardcode id
        autoComplete="email" // for sign-in form, must override with "username"
        type="email"
        autoCapitalize="off"
        autoCorrect="off"
        inputMode="email"
        {...props}
      />
      <Accordion isOpen={isError}>
        <p className="errorText">{errorMsg}</p>
      </Accordion>
    </div>
  );
}
