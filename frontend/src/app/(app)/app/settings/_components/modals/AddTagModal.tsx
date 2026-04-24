import { useState } from "react";
import { useWorkspaceMutation } from "@/utils/hooks";
import Modal from "@/utils/components/modal/Modal";
import { Workspace } from "@/utils/types";
import Button from "@/utils/components/Button";
import Input from "@/utils/components/Input";
import ErrorMessage from "@/utils/components/ErrorMessage";

export default function AddTagModal({
  workspace,
  setAddTagModal,
  clickedTag,
}: {
  workspace: Workspace;
  setAddTagModal: React.Dispatch<React.SetStateAction<boolean>>;
  clickedTag: string;
}) {
  const { mutateAsync: mutateWorkspaceAsync, error, isError, isPending } = useWorkspaceMutation();
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
      setValidationError("Please enter a tag.");
      return;
    }
    if (workspace.tags.some((i) => i.toLowerCase() === _tag.toLowerCase())) {
      setValidationError("Tag already exists.");
      return;
    }
    if (_tag === "none") {
      setValidationError(`Cannot use "none" as a tag.`);
      return;
    }

    setValidationError("");
    setStatus("adding");

    // mutation
    try {
      await mutateWorkspaceAsync({ type: "addTag", workspaceId: workspace._id, tag: _tag });
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
      await mutateWorkspaceAsync({ type: "renameTag", workspaceId: workspace._id, from: clickedTag, to: _tag });
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
      await mutateWorkspaceAsync({ type: "deleteTag", workspaceId: workspace._id, tag: clickedTag });
      setAddTagModal(false);
    } catch {
      setStatus("initial"); // error will show on UI
    }
  }

  return (
    <Modal title={isEdit ? "Edit Tag" : "Add A Tag"} onClose={() => setAddTagModal(false)} disabled={isPending}>
      <form className="w-full flex flex-col" onSubmit={onSubmit}>
        <label className="inputLabel">Tag{isEdit ? "" : " (e.g., Camping May 2025, Ava's birthday)"}</label>
        <Input
          className="w-full"
          inputSize="base"
          variant="primary"
          value={tag}
          onChange={(e) => {
            setTag(e.target.value);
            if (validationError) setValidationError("");
          }}
          onBlur={isEdit ? onRename : undefined}
        />
        {/*--- validation error ---*/}
        <ErrorMessage message={validationError ? validationError : isError ? error?.message : ""} />
        {/*--- button ---*/}
        {isEdit ? (
          <Button
            className="w-full"
            label="Delete Tag"
            variant="danger"
            size="base"
            isLoading={status === "deleting"}
            onClick={onDelete}
            disabled={status !== "initial" || isPending}
          ></Button>
        ) : (
          <Button
            className="w-full"
            label="Add Tag"
            variant="primary"
            size="base"
            isLoading={status === "adding"}
            type="submit"
            disabled={status !== "initial" || isPending}
          />
        )}
      </form>
    </Modal>
  );
}
