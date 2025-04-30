interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  className?: string;
}

export default function Button({ text, className = "", ...props }: ButtonProps) {
  return (
    <button className={`mt-[30px] h-[52px] button1Color rounded-[12px] text-xl desktop:text-lg font-medium cursor-pointer ${className}`} {...props}>
      {text}
    </button>
  );
}
