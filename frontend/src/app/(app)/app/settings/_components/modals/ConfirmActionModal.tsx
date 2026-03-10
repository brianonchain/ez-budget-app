import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSettingsMutation, useUserMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";

export default function DeleteAccountModal({
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
  const [errorMessage, setErrorMessage] = useState("");

  // updated on every render
  const isMatch = inputValue.trim() === textToMatch;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    // normalize
    const _inputValue = inputValue.trim();
    // exists
    if (!_inputValue) {
      setErrorMessage("Please enter the bolded text.");
      return;
    }
    // matches
    if (_inputValue !== textToMatch) {
      setErrorMessage("Input does not match the bolded text.");
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
        <p className="text-center">
          Type <span className="font-semibold">{textToMatch}</span> to confirm deletion.
        </p>
        {/*--- input ---*/}
        <input
          className="mt-4 w-full input"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.currentTarget.value);
            if (errorMessage) setErrorMessage("");
          }}
          onBlur={(e) => {
            if (inputValue.trim() && e.currentTarget.value !== textToMatch) {
              setErrorMessage("Input does not match the bolded text.");
            }
          }}
          type="text"
          disabled={isPending}
          autoFocus
        />
        {/*--- error message ---*/}
        <div className="errorText min-h-[80px] flex items-center justify-center text-center">
          {errorMessage || (isError ? error?.message : "")}
        </div>
        {/*--- button ---*/}
        <button className="buttonRed w-full" type="submit" disabled={!isMatch || isPending}>
          {isPending ? "Deleting..." : "Delete"}
        </button>
      </form>
    </Modal>
  );
}
