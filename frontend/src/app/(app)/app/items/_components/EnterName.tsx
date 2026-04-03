import { useState } from "react";
import { DraftItem } from "@/utils/types";
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/Modal";
import ErrorMessage from "@/utils/components/ErrorMessage";

export default function EnterName({
  setNameModal,
  setDetailsModal,
  setDraftItem,
}: {
  setNameModal: React.Dispatch<React.SetStateAction<boolean>>;
  setDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
}) {
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage("Enter an item description");
      return;
    }
    setDraftItem((prev) => ({ ...prev, description }));
    setNameModal(false);
    setDetailsModal(true);
  }

  return (
    <Modal title="Enter Name" setModal={setNameModal}>
      <form onSubmit={handleSubmit} className="mx-auto flex-none pt-10 desktop:pt-0 w-full max-w-100">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          className="p-4 w-full h-50 desktop:h-30 text-2xl desktop:text-lg rounded-2xl inputPrimaryColor"
          placeholder="Enter a short item description"
          autoFocus
        />
        <ErrorMessage message={errorMessage} />
        <Button className="w-full" label="Enter" variant="primary" size="base" type="submit" />
      </form>
    </Modal>
  );
}
