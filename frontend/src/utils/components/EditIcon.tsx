import React from "react";
import Button from "./Button";
import { FiEdit2 } from "react-icons/fi";

export default function EditIcon({ onClick, ariaLabel, className = "" }: { onClick: () => void; ariaLabel: string; className?: string }) {
  return (
    <Button
      className={className}
      variant="outline"
      size="icon"
      icon={<FiEdit2 className="textXs text-textTertiary" />}
      onClick={onClick}
      aria-label={ariaLabel}
    />
  );
}
