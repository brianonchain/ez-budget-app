import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Modal from "@/utils/components/modal/Modal";
import EditButtons from "./EditButtons";
import { useWorkspaceMutation } from "@/utils/hooks";
import { Workspace } from "@/utils/types";
import Button from "@/utils/components/Button";
import Input from "@/utils/components/Input";
import SettingsAddButton from "../SettingsAddButton";
import InnerErrorModal from "@/utils/components/simpleModal/InnerErrorModal";

export type SubcategoryWithId = { value: string; isNew: boolean };
export type AddCategoryModalStatus = "initial" | "adding" | "editing" | "deleting" | `deletingSubcategory${number}`;

export default function AddCategoryModal({
  workspace,
  setAddCategoryModal,
  clickedCategory,
  setClickedCategory,
}: {
  workspace: Workspace;
  setAddCategoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  clickedCategory: string | null;
  setClickedCategory: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const isEdit = !!clickedCategory;

  const [draftCategory, setDraftCategory] = useState(clickedCategory ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState<AddCategoryModalStatus>("initial"); // need status because we have 2 buttons; tanstack query isPending not enough
  const [subcategoriesWithId, setSubcategoriesWithId] = useState<SubcategoryWithId[]>(() => {
    if (isEdit) {
      const subs = workspace.categoryObjects.find((i) => i.category === clickedCategory)?.subcategories ?? [];
      return subs.filter((i) => i && i !== "none").map((i) => ({ value: i, isNew: false }));
    } else {
      return [
        { value: "", isNew: true },
        { value: "", isNew: true },
      ];
    }
  });

  const { mutateAsync: mutateWorkspaceAsync, error, isError, isPending, reset: resetWorkspaceMutation } = useWorkspaceMutation();

  // sync UI states with server state
  useEffect(() => {
    if (!isEdit || !workspace || status !== "initial" || isPending) return;
    // sync category
    const obj = workspace.categoryObjects.find((c) => c.category === clickedCategory);
    if (!obj) return;
    setDraftCategory(obj.category);
    // sync subcategories
    setSubcategoriesWithId(obj.subcategories.filter((s) => s && s !== "none").map((s) => ({ value: s, isNew: false })));
  }, [workspace.categoryObjects, clickedCategory]);

  // add category (not optimistic)
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspace || status !== "initial" || isPending || isEdit) return;
    const _category = draftCategory.trim();
    if (!_category) {
      setErrorMessage("Please enter a category");
      return;
    }
    if (workspace.categoryObjects.some((i) => i.category.toLowerCase() === _category.toLowerCase())) {
      setErrorMessage("Category already exists");
      return;
    }
    if (_category.toLowerCase() === "none" || subcategoriesWithId.some((i) => i.value.trim().toLowerCase() === "none")) {
      setErrorMessage(`Cannot use "none" as a category or subcategory`);
      return;
    }
    const normalizedSubs = subcategoriesWithId.map((i) => i.value.trim().toLowerCase()).filter((i) => i !== "");
    if (new Set(normalizedSubs).size !== normalizedSubs.length) {
      setErrorMessage("Subcategories cannot contain duplicates");
      return;
    }

    setErrorMessage("");
    setStatus("adding");

    // dedupe subcategories and remove "none"
    const cleaned = Array.from(
      new Set(
        subcategoriesWithId
          .map((i) => i.value.trim())
          .filter((i) => i !== "")
          .filter((i) => i.toLowerCase() !== "none"),
      ),
    );
    const _subcategories = ["none", ...cleaned];

    try {
      await mutateWorkspaceAsync({
        type: "addCategoryObject",
        workspaceId: workspace._id,
        categoryObject: { category: _category, subcategories: _subcategories },
      });
      setAddCategoryModal(false);
    } catch {
      setStatus("initial");
    }
  }

  // partly optimistic (value is immediately updated and reverts if error; but workspace is not updated immediately)
  async function renameCategory() {
    if (!workspace || status !== "initial" || isPending || !isEdit) return;
    const from = clickedCategory;
    const to = draftCategory.trim();
    if (!to) {
      setDraftCategory(from);
      if (errorMessage) setErrorMessage("");
      return;
    }
    if (to.toLowerCase() === "none") {
      setErrorMessage(`Cannot use "none" as a category`);
      return;
    }
    if (from === to) return;
    if (from.toLowerCase() !== to.toLowerCase() && workspace.categoryObjects.some((i) => i.category.toLowerCase() === to.toLowerCase())) {
      setErrorMessage("Category already exists"); // allows food => Food
      return;
    }

    setErrorMessage("");
    setStatus("editing");

    try {
      await mutateWorkspaceAsync({ type: "renameCategory", workspaceId: workspace._id, from, to });
      setClickedCategory(to); // update clickedCategory
    } catch {} // error will show on UI
    setStatus("initial");
  }

  // not optimistic
  async function deleteCategoryObject() {
    if (!workspace || status !== "initial" || isPending || !isEdit) return;
    setErrorMessage(""); // is-being-used validation done on backend
    setStatus("deleting");

    try {
      await mutateWorkspaceAsync({ type: "deleteCategoryObject", workspaceId: workspace._id, category: clickedCategory });
      setAddCategoryModal(false);
    } catch {
      setStatus("initial"); // error will show on UI
    }
  }

  async function addSubcategory(index: number) {
    if (!workspace || !isEdit || status !== "initial" || isPending || !subcategoriesWithId[index].isNew) return;
    const subcategory = subcategoriesWithId[index].value.trim();
    if (!subcategory) return;
    if (subcategory.toLowerCase() === "none") {
      setErrorMessage(`Cannot use "none" as a subcategory`);
      return;
    }
    if (subcategoriesWithId.some((j, index2) => index !== index2 && j.value.toLowerCase() === subcategory.toLowerCase())) {
      setErrorMessage("Subcategory already exists");
      return;
    }

    setErrorMessage("");
    setStatus("adding");

    try {
      await mutateWorkspaceAsync({ type: "addSubcategory", workspaceId: workspace._id, category: clickedCategory, subcategory });
      setSubcategoriesWithId((prev) => prev.map((r, i) => (i === index ? { ...r, isNew: false, value: subcategory } : r))); // optimistic update
    } catch {} // error will show on UI
    setStatus("initial");
  }

  async function renameSubcategory(index: number) {
    if (!workspace || !isEdit || status !== "initial" || isPending) return;
    const from = workspace.categoryObjects.find((i) => i.category === clickedCategory)?.subcategories[index + 1];
    const to = subcategoriesWithId[index].value.trim();
    if (!from) {
      setErrorMessage("Unknown error");
      return;
    }
    if (!to) {
      setSubcategoriesWithId((prev) => prev.map((j, index2) => (index2 === index ? { ...j, value: from } : j)));
      if (errorMessage) setErrorMessage("");
      return;
    }
    if (to.toLowerCase() === "none") {
      setSubcategoriesWithId((prev) => prev.map((j, index2) => (index2 === index ? { ...j, value: from } : j)));
      setErrorMessage(`Cannot use "none" as a subcategory`);
      return;
    }
    if (from === to) return;
    if (
      from.toLowerCase() !== to.toLowerCase() &&
      subcategoriesWithId.some((j, index2) => index2 !== index && j.value.trim().toLowerCase() === to.toLowerCase())
    ) {
      setErrorMessage("Subcategories contain duplicates.");
      return;
    } // allows groceries => Groceries

    setErrorMessage("");
    setStatus("editing");

    try {
      await mutateWorkspaceAsync({ type: "renameSubcategory", workspaceId: workspace._id, category: clickedCategory, from, to });
    } catch {} // error will show on UI
    setStatus("initial");
  }

  async function addSubcategoryField() {
    if (status !== "initial" || isPending) return;
    // in editing mode, can only add 1 subcategory at a time
    if (isEdit && subcategoriesWithId.some((r) => r.isNew && r.value.trim() === "")) {
      setErrorMessage("Please first add a subcategory above");
      return;
    }
    setErrorMessage("");
    setSubcategoriesWithId((prev) => [...prev, { value: "", isNew: true }]);
  }

  return (
    <Modal title={isEdit ? "Edit Category" : "New Category"} onClose={() => setAddCategoryModal(false)} disabled={isPending}>
      <form className="w-full flex flex-col" onSubmit={onSubmit}>
        {/*--- category ---*/}
        <label className="inputLabel">Category{isEdit ? "" : " (e.g., Food)"}</label>
        <Input
          className="w-full"
          inputSize="base"
          variant="primary"
          value={draftCategory}
          onChange={(e) => {
            setDraftCategory(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          onBlur={isEdit ? renameCategory : undefined}
        />
        {/*--- subcategory ---*/}
        <label className="mt-6 inputLabel">Subcategories{isEdit ? "" : " (e.g., restaurants, groceries)"}</label>
        <div className="space-y-2">
          {subcategoriesWithId.map((i, index) => (
            <div key={index} className="w-full flex items-center">
              <Input
                className="flex-1"
                inputSize="base"
                variant="primary"
                value={i.value}
                onChange={(e) => {
                  setSubcategoriesWithId((prev) => prev.map((j, index2) => (index2 === index ? { ...j, value: e.target.value } : j))); // or use id
                  if (errorMessage) setErrorMessage("");
                }}
                onBlur={isEdit ? (i.isNew ? () => addSubcategory(index) : () => renameSubcategory(index)) : undefined}
                disabled={status !== "initial" || isPending}
              />
              {isEdit && (
                <EditButtons
                  workspaceId={workspace._id}
                  setSubcategoriesWithId={setSubcategoriesWithId}
                  errorMessage={errorMessage}
                  setErrorMessage={setErrorMessage}
                  status={status}
                  setStatus={setStatus}
                  subcategoriesWithId={subcategoriesWithId}
                  rowIndex={index}
                  clickedCategory={clickedCategory}
                />
              )}
            </div>
          ))}
        </div>
        {/*--- add subcategory button ---*/}
        <SettingsAddButton
          className="self-center mt-4"
          onClick={addSubcategoryField}
          disabled={isPending || status !== "initial"}
          label="Subcategory Field"
        />

        {/*--- button ---*/}
        {isEdit ? (
          <Button
            className="mt-20 w-full"
            label="Delete"
            variant="dangerOutline2"
            size="base"
            isLoading={status === "deleting"}
            onClick={deleteCategoryObject}
            disabled={isPending || status !== "initial"}
          />
        ) : (
          <Button
            className="mt-12 w-full"
            label={isEdit ? "Save" : "Add"}
            isLoading={isPending}
            variant="primary"
            size="base"
            type="submit"
            disabled={isPending || status !== "initial"}
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
