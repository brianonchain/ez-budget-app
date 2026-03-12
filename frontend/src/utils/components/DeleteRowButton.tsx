import React from "react";
import { FaX, FaCircleNotch } from "react-icons/fa6";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  className?: string;
}

export default function DeleteRowButton({ isLoading = false, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`flex-none ml-3 desktop:ml-5 w-10 h-10 desktop:w-auto desktop:h-8 text-2xl desktop:text-lg flex justify-center items-center desktop:cursor-pointer linkRedColor ${className}`}
      type="button"
      {...props}
    >
      {isLoading ? <FaCircleNotch className="animate-spin" /> : <FaX className="text-lg desktop:text-sm" />}
    </button>
  );
}
