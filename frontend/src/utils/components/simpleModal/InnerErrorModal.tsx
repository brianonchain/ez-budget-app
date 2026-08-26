"use client";
import SimpleModal from "@/utils/components/simpleModal/SimpleModal";
import Button from "@/utils/components/Button";
import { FaTriangleExclamation } from "react-icons/fa6";

export default function InnerErrorModal({ errorMessage, onClose }: { errorMessage: string; onClose: () => void }) {
  return (
    <SimpleModal ariaLabel="Confirm delete" isInnerModal={true}>
      <div className="w-full flex flex-col items-center gap-12">
        <FaTriangleExclamation className="text-5xl text-textDanger" />
        <p>{errorMessage}</p>
        <Button className="w-full" label="Close" variant="primary" size="base" onClick={onClose} />
      </div>
    </SimpleModal>
  );
}
