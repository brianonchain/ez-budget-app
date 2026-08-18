import { ImSpinner2 } from "react-icons/im";

export default function Spinner({ buttonVariant, className }: { buttonVariant?: string; className?: string }) {
  return (
    <ImSpinner2
      className={`animate-spin size-[32px] desktop:size-[24px] ${
        buttonVariant === "primary" ? "text-buttonPrimaryText" : "text-textTertiary"
      } ${className}`}
    />
  );
}
