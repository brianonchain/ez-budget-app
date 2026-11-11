"use client";
import SimpleModal from "@/utils/components/simpleModal/SimpleModal";
import { Button } from "@/utils/components/controls/Button";
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
      <div className="mt-1 w-full flex flex-col items-center gap-8 tablet:gap-12 desktop:gap-10">
        <p id={messageId} className="textLg">
          Confirm sign out?
        </p>
        <div className="w-full grid grid-cols-2 gap-4 tablet:gap-6 desktop:gap-4">
          <Button text="Cancel" onClick={onClose} disabled={isSigningOut} />
          <Button text="Sign Out" variant="outline" onClick={onSignOut} isLoading={isSigningOut} />
        </div>
      </div>
    </SimpleModal>
  );
}
