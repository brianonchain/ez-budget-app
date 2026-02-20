import { useState } from "react";
import { useSettingsMutation, useUserQuery } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";

export default function AddTagModal({ setAddTagModal, data }: { setAddTagModal: any; data: any }) {
  const { mutateAsync: settingsMutateAsync, error, isError, isPending } = useSettingsMutation();
  const [validationError, setValidationError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const tagValue = document.querySelector<HTMLInputElement>('input[data-type="tags"]')?.value.trim() ?? "";

    // validation
    if (!data) return;
    if (!tagValue) {
      setValidationError("Please enter a tag");
      return;
    }
    if (data.settings.tags.includes(tagValue)) {
      setValidationError("Tag already exists");
      return;
    }
    setValidationError("");

    // mutation
    try {
      await settingsMutateAsync({ "settings.tags": [...data.settings.tags, tagValue] });
      setAddTagModal(false);
    } catch {
      return; // don't close modal so user sees error message
    }
  }

  return (
    <Modal title="Add A Tag" setIsOpen={setAddTagModal} disableCloseButton={isPending}>
      <form onSubmit={onSubmit}>
        <label className="mt-[16px] pb-1.5 w-full inputLabel">Tags (e.g., Euro Trip 2025, Winnie's birthday)</label>
        <input className="mt-[4px] w-full input" data-type="tags" />
        {/*--- button ---*/}
        <button className="mt-[40px] button1 w-full" type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add"}
        </button>
      </form>
      <div className="errorText mt-5 desktop:mt-3 min-h-[1.3rem]">{validationError ? validationError : isError ? error?.message : ""}</div>
    </Modal>
  );
}
