import React from "react";
import { Button } from "./controls/Button";
import { FiEdit2 } from "react-icons/fi";

export default function EditIcon({ onClick, ariaLabel, className = "" }: { onClick: () => void; ariaLabel: string; className?: string }) {
  return (
    <div className={className}>
      <Button
        variant="outline"
        size="icon"
        iconLeft={<FiEdit2 className="textXs text-muted-foreground" />}
        onClick={onClick}
        aria-label={ariaLabel}
      />
    </div>
  );
}
