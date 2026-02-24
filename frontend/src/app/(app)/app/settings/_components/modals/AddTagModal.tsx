import { useState } from "react";
import { useSettingsMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
import { UserData } from "@/utils/types";

export default function AddTagModal({
  data,
  setAddTagModal,
  clickedTag,
}: {
  data: UserData | null | undefined;
  setAddTagModal: React.Dispatch<React.SetStateAction<boolean>>;
  clickedTag: string;
}) {
  const { mutateAsync: settingsMutateAsync, error, isError, isPending } = useSettingsMutation();
  const [validationError, setValidationError] = useState("");
  const [tag, setTag] = useState(clickedTag);
  const [status, setStatus] = useState<"initial" | "addingOrEditing" | "deleting">("initial"); // need status because we have 2 buttons; tanstack query isPending not enough

  async function onAddOrEdit(e: React.FormEvent) {
    e.preventDefault();
    const _tag = tag.trim();

    // validation
    if (!data || status !== "initial") return;
    if (!_tag) {
      setValidationError("Please enter a tag");
      return;
    }
    if (_tag === clickedTag) {
      setValidationError("No changes made");
      return;
    }
    if (data.settings.tags.includes(_tag)) {
      setValidationError("Tag already exists");
      return;
    }
    if (_tag === "none") {
      setValidationError(`Cannot use "none" as a tag`);
      return;
    }
    setValidationError("");
    setStatus("addingOrEditing");

    // mutation
    const newTags = clickedTag
      ? data.settings.tags.map((existingTag: string) => (existingTag === clickedTag ? _tag : existingTag))
      : [...data.settings.tags, _tag];
    try {
      await settingsMutateAsync({
        changes: { "settings.tags": newTags },
        ...(clickedTag ? { ops: [{ type: "renameTagEverywhere", from: clickedTag, to: _tag }] } : {}),
      });
      setAddTagModal(false);
    } catch {
      setStatus("initial"); // keep modal open
    }
  }

  async function onDelete() {
    // validation
    if (!data || !clickedTag || status !== "initial" || isPending) return;
    if (clickedTag !== tag.trim()) {
      setValidationError("Tag has been changed. Please save changes before deleting.");
      return;
    }
    if (data.items.some((item) => item.tags === clickedTag)) {
      setValidationError("This tag is being used in at least one item. You must remove this tag from all items before you can delete it.");
      return;
    }
    setValidationError("");
    setStatus("deleting");

    // mutation
    try {
      await settingsMutateAsync({ ops: [{ type: "deleteTag", tag: clickedTag }] });
      setAddTagModal(false);
    } catch {
      setStatus("initial"); // keep modal open
    }
  }

  return (
    <Modal title={clickedTag ? "Edit Tag" : "Add A Tag"} setIsOpen={setAddTagModal} disableCloseButton={isPending}>
      <div className="mx-auto w-full max-w-[400px] flex flex-col items-center">
        <form className="w-full" onSubmit={onAddOrEdit}>
          <label className="mt-[16px] pb-1.5 w-full inputLabel">Tags (e.g., Euro Trip 2025, Winnie's birthday)</label>
          <input
            className="mt-[4px] w-full input"
            value={tag}
            onChange={(e) => {
              setTag(e.target.value);
              if (validationError) setValidationError("");
            }}
          />
          {/*--- button ---*/}
          <button className="mt-[24px] button1 w-full" type="submit" disabled={status !== "initial"}>
            {status === "addingOrEditing" ? (clickedTag ? "Saving..." : "Adding...") : clickedTag ? "Save" : "Add"}
          </button>
        </form>
        <div className="errorText mt-5 desktop:mt-3 min-h-[1.3rem]">
          {validationError ? validationError : isError ? error?.message : ""}
        </div>
        {clickedTag && (
          <div className="w-full grow flex flex-col justify-end">
            <button className="mt-[100px] buttonRed w-full" onClick={onDelete} type="button" disabled={status !== "initial"}>
              {status === "deleting" ? "Deleting..." : "Delete Tag"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
