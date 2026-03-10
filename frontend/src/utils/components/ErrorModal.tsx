import Modal from "@/utils/components/Modal";

export default function DeleteAccountModal({
  errorMessage,
  setErrorMessage,
  setErrorModal,
}: {
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Modal title={""} setModal={setErrorModal}>
      <div className="w-full h-full flex items-center justify-center">{errorMessage}</div>
    </Modal>
  );
}
