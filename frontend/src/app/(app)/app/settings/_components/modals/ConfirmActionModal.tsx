import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSettingsMutation, useUserMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
import Button from "@/utils/components/Button";
import Input from "@/utils/components/Input";
import ErrorMessage from "@/utils/components/ErrorMessage";

export default function ConfirmActionModal({
  setModal,
  title,
  textToMatch,
  userMutateAsyncPayload,
  onSuccess,
}: {
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  textToMatch: string;
  userMutateAsyncPayload: any;
  onSuccess?: () => void;
}) {
  // hooks
  const { mutateAsync: userMutateAsync, error, isError, isPending } = useUserMutation();
  // states
  const [inputValue, setInputValue] = useState("");
  const [validationError, setValidationError] = useState("");

  // updated on every render
  const isMatch = inputValue.trim() === textToMatch;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    // normalize
    const _inputValue = inputValue.trim();
    // exists
    if (!_inputValue) {
      setValidationError("Please enter the bolded text.");
      return;
    }
    // matches
    if (_inputValue !== textToMatch) {
      setValidationError("Input does not match the bolded text.");
      return;
    }
    // mutation
    try {
      await userMutateAsync(userMutateAsyncPayload);
      setModal(false);
      onSuccess?.();
    } catch {} // error will show on UI
    // reset
    setInputValue("");
  }
  return (
    <Modal title={title} setModal={setModal} disableCloseButton={isPending}>
      <form className="mx-auto w-full max-w-100 flex flex-col" onSubmit={onSubmit}>
        <p>
          Type <span className="font-semibold">{textToMatch}</span> to confirm deletion.
        </p>
        {/*--- input ---*/}
        <Input
          className="mt-4 w-full"
          inputSize="base"
          variant="primary"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.currentTarget.value);
            if (validationError) setValidationError("");
          }}
          onBlur={(e) => {
            if (inputValue.trim() && e.currentTarget.value !== textToMatch) {
              setValidationError("Input does not match the bolded text.");
            }
          }}
          type="text"
          disabled={isPending}
          autoFocus
        />
        {/*--- error message ---*/}
        <ErrorMessage message={validationError ? validationError : isError ? error?.message : ""} />
        {/*--- button ---*/}
        <Button
          className="w-full"
          label="Delete"
          variant="danger"
          size="base"
          type="submit"
          isLoading={isPending}
          disabled={!isMatch || isPending}
        />
      </form>
    </Modal>
  );
}
