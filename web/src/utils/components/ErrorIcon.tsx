import { FaTriangleExclamation } from "react-icons/fa6";

export default function ErrorIcon({ className = "" }: { className?: string }) {
  return <FaTriangleExclamation aria-hidden="true" className={`size-10 tablet:size-12 desktop:size-10 text-destructive ${className}`} />;
}
