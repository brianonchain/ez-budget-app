"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useUserMutation } from "@/utils/hooks";
import Modal from "@/utils/components/modal/Modal";
import Button from "@/utils/components/Button";
import Input from "@/utils/components/Input";
import InnerErrorModal from "@/utils/components/simpleModal/InnerErrorModal";

export default function ConfirmHighRiskModal({
  onClose,
  title,
  textToMatch,
  userMutateAsyncPayload,
  onSuccess,
}: {
  onClose: () => void;
  title: string;
  textToMatch: string;
  userMutateAsyncPayload: any;
  onSuccess?: () => void;
}) {
  // hooks
  const { mutateAsync: userMutateAsync, error, isError, isPending, reset: resetUserMutation } = useUserMutation();
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
      setErrorMessage("Please enter the bolded text");
      return;
    }
    // matches
    if (_inputValue !== textToMatch) {
      setErrorMessage("Input does not match the bolded text");
      return;
    }
    // mutation
    try {
      await userMutateAsync(userMutateAsyncPayload);
      onClose();
      onSuccess?.();
    } catch {} // error will show on UI
    // reset
    setInputValue("");
  }
  return (
    <Modal title={title} onClose={onClose} disabled={isPending}>
      <form className="w-full flex flex-col" onSubmit={onSubmit}>
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

        {/*--- button ---*/}
        <Button
          className="mt-16 tablet:mt-12 desktop:mt-10 w-full"
          label="Delete"
          variant="dangerOutline2"
          size="base"
          type="submit"
          isLoading={isPending}
          disabled={isPending}
        />
      </form>

      {/*--- error modal ---*/}
      <AnimatePresence>
        {(errorMessage || isError) && (
          <InnerErrorModal
            errorMessage={errorMessage || error?.message || "Unknown error"}
            onClose={() => {
              setErrorMessage("");
              resetUserMutation();
            }}
          />
        )}
      </AnimatePresence>
    </Modal>
  );
}
