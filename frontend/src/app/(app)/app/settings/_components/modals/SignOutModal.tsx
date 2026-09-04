"use client";
import SimpleModal from "@/utils/components/simpleModal/SimpleModal";
import Button from "@/utils/components/Button";
import { useId } from "react";

export default function SignOutModal({
  onClose,
  onSignOut,
  isSigningOut = false,
}: {
  onClose: () => void;
  onSignOut: () => void;
  isSigningOut?: boolean;
}) {
  const messageId = useId();

  return (
    <SimpleModal ariaLabel="Confirm sign out" messageId={messageId}>
      <div className="mt-1 w-full flex flex-col items-center gap-7 desktop:gap-8">
        <p id={messageId} className="textBase text-textPrimary">
          Confirm sign out?
        </p>
        <div className="w-full grid grid-cols-2 gap-4">
          <Button label="Cancel" variant="primary" size="base" onClick={onClose} disabled={isSigningOut} />
          <Button label="Sign Out" variant="outline" size="base" onClick={onSignOut} disabled={isSigningOut} isLoading={isSigningOut} />
        </div>
      </div>
    </SimpleModal>
  );
}
