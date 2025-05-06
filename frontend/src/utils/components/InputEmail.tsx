import Accordion from "./Accordion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  _id: string;
  isError: boolean;
  errorMsg?: string;
  className?: string;
}

export default function InputEmail({ className = "", label, _id, isError = false, errorMsg = "", ...props }: InputProps) {
  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <label className="inputLabel" htmlFor={_id}>
        {label}
      </label>
      <input id={_id} className={`input ${isError ? "borderColorError" : ""}`} type="email" autoCapitalize="off" autoCorrect="off" inputMode="email" {...props} />
      <Accordion isOpen={isError}>
        <p className="errorText">{errorMsg}</p>
      </Accordion>
    </div>
  );
}
