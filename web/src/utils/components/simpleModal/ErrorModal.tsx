"use client";
import { useId } from "react";
import { Button } from "@/utils/components/controls/Button";
import ErrorIcon from "@/utils/components/ErrorIcon";
import SimpleModal from "@/utils/components/simpleModal/SimpleModal";

export default function ErrorModal({ errorMessage, onClose }: { errorMessage: string; onClose: () => void }) {
  const messageId = useId();

  return (
    <SimpleModal ariaLabel="Error" messageId={messageId}>
      <div className="w-full flex flex-col items-center gap-12">
        <ErrorIcon />
        <p id={messageId} className="textLg">
          {errorMessage}
        </p>
        <Button className="w-full" text="Close" onClick={onClose} />
      </div>
    </SimpleModal>
  );
}
