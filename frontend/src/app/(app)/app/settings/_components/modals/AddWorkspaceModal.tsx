import { useState } from "react";
import { useUserMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
import { CURRENCIES } from "@/utils/constants";

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
    <Modal title="Add New Workspace" setIsOpen={setAddWorkspaceModal} disableCloseButton={isPending}>
      <form className="mx-auto w-full max-w-[400px] flex flex-col items-center" onSubmit={onSubmit}>
        <label className="mt-[16px] pb-1.5 w-full inputLabel">Workspace Name</label>
        <input
          className="mt-[4px] w-full input"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (validationError) setValidationError("");
          }}
        />
        <label className="mt-[16px] pb-1.5 w-full inputLabel">Default Currency</label>
        <select
          className="mt-[4px] w-full input"
          value={defaultCurrency}
          onChange={(e) => {
            setDefaultCurrency(e.target.value);
          }}
        >
          {CURRENCIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        {/*--- error message ---*/}
        <div className="errorText mt-[16px] w-full min-h-[3.3em]">{validationError ? validationError : isError ? error?.message : ""}</div>
        {/*--- button ---*/}
        <button className="mt-[12px] desktop:mt-[12px] button1 w-full" type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create New Workspace"}
        </button>
      </form>
    </Modal>
  );
}
