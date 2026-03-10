import Modal from "@/utils/components/Modal";

export default function DeleteAccountModal({
  errorMessage,
  setErrorModal,
}: {
  errorMessage: string;
  setErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Modal title={""} setIsOpen={setErrorModal}>
      <div className="w-full h-full flex items-center justify-center">{errorMessage}</div>
    </Modal>
  );
}
