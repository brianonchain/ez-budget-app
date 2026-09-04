import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useWorkspaceMutation } from "@/utils/hooks";
import Modal from "@/utils/components/modal/Modal";
import { Workspace } from "@/utils/types";
import Button from "@/utils/components/Button";
import Input from "@/utils/components/Input";
import InnerErrorModal from "@/utils/components/simpleModal/InnerErrorModal";

export default function AddTagModal({
  workspace,
  setAddTagModal,
  clickedTag,
}: {
  workspace: Workspace;
  setAddTagModal: React.Dispatch<React.SetStateAction<boolean>>;
  clickedTag: string;
}) {
  const { mutateAsync: mutateWorkspaceAsync, error, isError, isPending, reset: resetWorkspaceMutation } = useWorkspaceMutation();
  const [errorMessage, setErrorMessage] = useState("");
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
      setErrorMessage("Please enter a tag");
      return;
    }
    if (workspace.tags.some((i) => i.toLowerCase() === _tag.toLowerCase())) {
      setErrorMessage("Tag already exists");
      return;
    }
    if (_tag === "none") {
      setErrorMessage(`Cannot use "none" as a tag`);
      return;
    }

    setErrorMessage("");
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
      setErrorMessage("Please enter a tag");
      return;
    }
    if (_tag === clickedTag) return;
    if (_tag.toLowerCase() !== clickedTag.toLowerCase() && workspace.tags.some((i) => i.toLowerCase() === _tag.toLowerCase())) {
      setErrorMessage("Tag already exists.");
      return;
    } // allows food => Food
    if (_tag === "none") {
      setErrorMessage(`Cannot use "none" as a tag`);
      return;
    }

    setErrorMessage("");
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
    setErrorMessage("");
    setStatus("deleting");

    try {
      await mutateWorkspaceAsync({ type: "deleteTag", workspaceId: workspace._id, tag: clickedTag });
      setAddTagModal(false);
    } catch {
      setStatus("initial"); // error will show on UI
    }
  }

  return (
    <Modal title={isEdit ? "Edit Tag" : "New Tag"} onClose={() => setAddTagModal(false)} disabled={isPending}>
      <form className="mt-2 w-full flex flex-col" onSubmit={onSubmit}>
        <label className="inputLabel">Tag{isEdit ? "" : " (e.g., Camping May 2025, Ava's birthday)"}</label>
        <Input
          className="w-full"
          inputSize="base"
          variant="primary"
          value={tag}
          onChange={(e) => {
            setTag(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          onBlur={isEdit ? onRename : undefined}
        />
        {/*--- button ---*/}
        {isEdit ? (
          <Button
            className="mt-16 w-full"
            label="Delete Tag"
            variant="dangerOutline2"
            size="base"
            isLoading={status === "deleting"}
            onClick={onDelete}
            disabled={status !== "initial" || isPending}
          ></Button>
        ) : (
          <Button
            className="mt-8 w-full"
            label="Add Tag"
            variant="primary"
            size="base"
            isLoading={status === "adding"}
            type="submit"
            disabled={status !== "initial" || isPending}
          />
        )}
      </form>

      {/*--- error modal ---*/}
      <AnimatePresence>
        {(errorMessage || isError) && (
          <InnerErrorModal
            errorMessage={errorMessage || error?.message || "Unknown error"}
            onClose={() => {
              setErrorMessage("");
              resetWorkspaceMutation();
            }}
          />
        )}
      </AnimatePresence>
    </Modal>
  );
}
