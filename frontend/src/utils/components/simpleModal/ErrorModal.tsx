"use client";
import Button from "@/utils/components/Button";
import { FaTriangleExclamation } from "react-icons/fa6";
import SimpleModal from "@/utils/components/simpleModal/SimpleModal";

export default function ErrorModal({ errorMessage, onClose }: { errorMessage: string; onClose: () => void }) {
  return (
    <SimpleModal ariaLabel="Error">
      <div className="w-full flex flex-col items-center gap-12">
        <FaTriangleExclamation className="text-5xl text-textDanger" />
        <p>{errorMessage}</p>
        <Button className="w-full" label="Close" variant="primary" size="base" onClick={onClose} />
      </div>
    </SimpleModal>
  );
}
