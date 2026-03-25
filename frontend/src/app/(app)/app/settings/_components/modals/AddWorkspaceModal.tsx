import { useState } from "react";
import { useUserMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
import { CURRENCIES } from "@/utils/constants";
import Button from "@/utils/components/Button";
import Input from "@/utils/components/Input";
import Select from "@/utils/components/Select";

export default function AddTagModal({
  workspaceId,
  setAddWorkspaceModal,
}: {
  workspaceId: string;
  setAddWorkspaceModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { mutateAsync: userMutateAsync, error, isError, isPending } = useUserMutation();
  const [validationError, setValidationError] = useState("");
  const [name, setName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");

  // add a new workspace
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    // validation
    const _name = name.trim();
    if (!_name) {
      setValidationError("Please enter a name for your workspace.");
      return;
    }
    // mutation
    setValidationError("");
    try {
      await userMutateAsync({ type: "addWorkspace", name: _name, defaultCurrency: defaultCurrency });
      setAddWorkspaceModal(false);
    } catch {} // error will show on UI
  }

  return (
    <Modal title="Add New Sheet" setModal={setAddWorkspaceModal} disableCloseButton={isPending}>
      <form className="mt-4 mx-auto w-full max-w-100 flex flex-col" onSubmit={onSubmit}>
        <label className="pb-1.5 w-full labelBase">Sheet Name</label>
        <Input
          className="w-full"
          inputSize="base"
          variant="primary"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (validationError) setValidationError("");
          }}
        />
        <label className="mt-[16px] pb-1.5 w-full labelBase">Default Currency</label>
        <Select
          className="w-full"
          selectSize="base"
          variant="primary"
          value={defaultCurrency}
          onChange={(e) => {
            setDefaultCurrency(e.target.value);
            if (validationError) setValidationError("");
          }}
        >
          {CURRENCIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </Select>
        {/*--- error message ---*/}
        <div className="min-h-26 desktop:min-h-20 modalErrorMessage">
          {validationError ? validationError : isError ? error?.message : ""}
        </div>
        {/*--- button ---*/}
        <Button
          className="w-full"
          label="Create New Sheet"
          variant="primary"
          size="base"
          type="submit"
          isLoading={isPending}
          disabled={isPending}
        />
      </form>
    </Modal>
  );
}
