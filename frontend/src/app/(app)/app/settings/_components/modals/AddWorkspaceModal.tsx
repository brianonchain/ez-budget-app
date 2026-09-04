import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useUserMutation } from "@/utils/hooks";
import Modal from "@/utils/components/modal/Modal";
import { CURRENCIES } from "@/utils/constants";
import Button from "@/utils/components/Button";
import Input from "@/utils/components/Input";
import Select from "@/utils/components/Select";
import InnerErrorModal from "@/utils/components/simpleModal/InnerErrorModal";

export default function AddWorkspaceModal({
  setAddWorkspaceModal,
}: {
  setAddWorkspaceModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { mutateAsync: userMutateAsync, error, isError, isPending, reset: resetUserMutation } = useUserMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");

  // add a new workspace
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    // validation
    const _name = name.trim();
    if (!_name) {
      setErrorMessage("Please enter a name for your workspace.");
      return;
    }
    // mutation
    setErrorMessage("");
    try {
      await userMutateAsync({ type: "addWorkspace", name: _name, defaultCurrency: defaultCurrency });
      setAddWorkspaceModal(false);
    } catch {} // error will show on UI
  }

  return (
    <Modal title="Create New Sheet" onClose={() => setAddWorkspaceModal(false)} disabled={isPending}>
      <form className="w-full flex flex-col" onSubmit={onSubmit}>
        <label className="inputLabel">Sheet Name</label>
        <Input
          className="w-full"
          inputSize="base"
          variant="primary"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
        />
        <label className="mt-4 inputLabel">Default Currency</label>
        <Select
          className="w-full"
          selectSize="base"
          variant="primary"
          value={defaultCurrency}
          onChange={(e) => {
            setDefaultCurrency(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
        >
          {CURRENCIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </Select>
        {/*--- button ---*/}
        <Button
          className="mt-10 w-full"
          label="Create New Sheet"
          variant="primary"
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
