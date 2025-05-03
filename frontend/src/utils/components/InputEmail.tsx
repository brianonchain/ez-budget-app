interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
}

export default function InputEmail({ label, error = "", className = "", ...props }: InputProps) {
  return (
    <div className={`flex flex-col relative ${className}`}>
      <div className="inputLabel">{label}</div>
      <div className="relative">
        <input className={`input ${error ? "!border-red-500 !focus:border-red-500" : ""}`} type="email" autoCapitalize="off" autoCorrect="off" inputMode="email" {...props} />
        {error && <p className="absolute right-0 bottom-[calc(100%+8px)] max-w-[70%] px-2 py-1 bg-red-500 text-white text-xs space-y-[8px] rounded-[8px]">{error}</p>}
      </div>
    </div>
  );
}
