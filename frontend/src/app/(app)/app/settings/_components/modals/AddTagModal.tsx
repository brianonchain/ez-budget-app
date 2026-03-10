import { useState } from "react";
import { useSettingsMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
import { Workspace } from "@/utils/types";

export default function AddTagModal({
  workspace,
  setAddTagModal,
  clickedTag,
}: {
  workspace: Workspace;
  setAddTagModal: React.Dispatch<React.SetStateAction<boolean>>;
  clickedTag: string;
}) {
  const { mutateAsync: settingsMutateAsync, error, isError, isPending } = useSettingsMutation();
  const [validationError, setValidationError] = useState("");
  const [tag, setTag] = useState(clickedTag);
  const [status, setStatus] = useState<"initial" | "adding" | "editing" | "deleting">("initial"); // need status because we have 2 buttons; tanstack query isPending not enough

  const isEdit = !!clickedTag;

  // add a new tag
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const _tag = tag.trim();

    // validation
    if (!workspace || status !== "initial" || isPending || isEdit) return;
    if (!_tag) {
      setValidationError("Please enter a tag");
      return;
    }
    if (workspace.tags.some((i) => i.toLowerCase() === _tag.toLowerCase())) {
      setValidationError("Tag already exists.");
      return;
    }
    if (_tag === "none") {
      setValidationError(`Cannot use "none" as a tag`);
      return;
    }

    setValidationError("");
    setStatus("adding");

    // mutation
    try {
      await settingsMutateAsync({ type: "addTag", workspaceId: workspace._id, tag: _tag });
      setAddTagModal(false);
    } catch {
      setStatus("initial"); // error will be shown on UI
    }
  }

  async function onRename() {
    const _tag = tag.trim();
    // validation
    if (!workspace || !clickedTag || status !== "initial" || isPending) return;
    if (!_tag) {
      setValidationError("Please enter a tag.");
      return;
    }
    if (_tag === clickedTag) return;
    if (_tag.toLowerCase() !== clickedTag.toLowerCase() && workspace.tags.some((i) => i.toLowerCase() === _tag.toLowerCase())) {
      setValidationError("Tag already exists.");
      return;
    } // allows food => Food
    if (_tag === "none") {
      setValidationError(`Cannot use "none" as a tag.`);
      return;
    }

    setValidationError("");
    setStatus("editing");

    // mutation
    try {
      await settingsMutateAsync({ type: "renameTag", workspaceId: workspace._id, from: clickedTag, to: _tag });
    } catch {
      // error will show on UI
    }
    setStatus("initial");
  }

  async function onDelete() {
    if (!workspace || !clickedTag || status !== "initial" || isPending) return;

    // is-being-used validation done on backend
    setValidationError("");
    setStatus("deleting");

    try {
      await settingsMutateAsync({ type: "deleteTag", workspaceId: workspace._id, tag: clickedTag });
      setAddTagModal(false);
    } catch {
      setStatus("initial"); // error will show on UI
    }
  }

  return (
    <Modal title={isEdit ? "Edit Tag" : "Add A Tag"} setIsOpen={setAddTagModal} disableCloseButton={status !== "initial" || isPending}>
      <form className="mx-auto w-full max-w-[400px] flex flex-col items-center" onSubmit={onSubmit}>
        <label className="mt-[16px] pb-1.5 w-full inputLabel">Tags (e.g., Euro Trip 2025, Winnie's birthday)</label>
        <input
          className="mt-[4px] w-full input"
          value={tag}
          onChange={(e) => {
            setTag(e.target.value);
            if (validationError) setValidationError("");
          }}
          onBlur={isEdit ? onRename : undefined}
        />
        {/*--- error message ---*/}
        <div className="errorText mt-[16px] w-full min-h-[3.3em]">{validationError ? validationError : isError ? error?.message : ""}</div>
        {/*--- button ---*/}
        {isEdit ? (
          <div className="mt-auto pt-[80px] w-full flex flex-col justify-end">
            <button className="buttonRed w-full" onClick={onDelete} type="button" disabled={status !== "initial" || isPending}>
              {status === "deleting" ? "Deleting..." : "Delete Tag"}
            </button>
          </div>
        ) : (
          <button className="mt-[12px] desktop:mt-[12px] button1 w-full" type="submit" disabled={status !== "initial" || isPending}>
            {status === "adding" ? "Adding..." : "Add Tag"}
          </button>
        )}
      </form>
    </Modal>
  );
}
