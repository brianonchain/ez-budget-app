import Accordion from "./Accordion";

type InputProps = {
  label: string;
  _id: string;
  isError: boolean;
  errorMsg?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputEmail({ className = "", label, _id, isError = false, errorMsg = "", ...props }: InputProps) {
  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <label className="inputLabel" htmlFor={_id}>
        {label}
      </label>
      <input
        id={_id}
        className={`input ${isError ? "!border-buttonRedBg focus:!border-buttonRedBg" : ""}`}
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
