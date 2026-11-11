import { ImSpinner2 } from "react-icons/im";

export default function Spinner({ color = "default", className }: { color?: "default" | "white"; className?: string }) {
  return (
    <ImSpinner2
      className={`animate-spin size-[32px] desktop:size-[24px] ${
        color === "white" ? "text-primary-foreground" : "text-muted-foreground"
      } ${className}`}
    />
  );
}
