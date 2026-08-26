"use client";
import SimpleModal from "@/utils/components/simpleModal/SimpleModal";
import Button from "@/utils/components/Button";

export default function InnerDeleteModal({
  message,
  onClose,
  onDelete,
  disabled = false,
  isLoading = false,
}: {
  message: string;
  onClose: () => void;
  onDelete: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  return (
    <SimpleModal ariaLabel="Confirm delete" isInnerModal={true}>
      <div className="mt-1 w-full flex flex-col items-center gap-7 desktop:gap-8">
        <p className="textBase text-textPrimary">{message}</p>
        <div className="w-full grid grid-cols-2 gap-4">
          <Button label="Cancel" variant="primary" size="base" onClick={onClose} disabled={disabled || isLoading} />
          <Button label="Delete" variant="dangerOutline2" size="base" onClick={onDelete} disabled={disabled} isLoading={isLoading} />
        </div>
      </div>
    </SimpleModal>
  );
}
