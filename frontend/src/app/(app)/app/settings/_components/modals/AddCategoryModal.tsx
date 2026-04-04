import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa6";
import Modal from "@/utils/components/Modal";
import EditButtons from "./EditButtons";
import { useSettingsMutation } from "@/utils/hooks";
import { Workspace } from "@/utils/types";
import Button from "@/utils/components/Button";
import Input from "@/utils/components/Input";
import SettingsAddButton from "../SettingsAddButton";
import ErrorMessage from "@/utils/components/ErrorMessage";

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
  const [validationError, setValidationError] = useState("");
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

  const { mutateAsync: settingsMutateAsync, error, isError, isPending } = useSettingsMutation();

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
      setValidationError("Please enter a category");
      return;
    }
    if (workspace.categoryObjects.some((i) => i.category.toLowerCase() === _category.toLowerCase())) {
      setValidationError("Category already exists.");
      return;
    }
    if (_category.toLowerCase() === "none" || subcategoriesWithId.some((i) => i.value.trim().toLowerCase() === "none")) {
      setValidationError(`Cannot use "none" as a category or subcategory.`);
      return;
    }
    const normalizedSubs = subcategoriesWithId.map((i) => i.value.trim().toLowerCase()).filter((i) => i !== "");
    if (new Set(normalizedSubs).size !== normalizedSubs.length) {
      setValidationError("Subcategories cannot contain duplicates.");
      return;
    }

    setValidationError("");
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
      await settingsMutateAsync({
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
      if (validationError) setValidationError("");
      return;
    }
    if (to.toLowerCase() === "none") {
      setValidationError(`Cannot use "none" as a category.`);
      return;
    }
    if (from === to) return;
    if (from.toLowerCase() !== to.toLowerCase() && workspace.categoryObjects.some((i) => i.category.toLowerCase() === to.toLowerCase())) {
      setValidationError("Category already exists."); // allows food => Food
      return;
    }

    setValidationError("");
    setStatus("editing");

    try {
      await settingsMutateAsync({ type: "renameCategory", workspaceId: workspace._id, from, to });
      setClickedCategory(to); // update clickedCategory
    } catch {} // error will show on UI
    setStatus("initial");
  }

  // not optimistic
  async function deleteCategoryObject() {
    if (!workspace || status !== "initial" || isPending || !isEdit) return;
    setValidationError(""); // is-being-used validation done on backend
    setStatus("deleting");

    try {
      await settingsMutateAsync({ type: "deleteCategoryObject", workspaceId: workspace._id, category: clickedCategory });
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
      setValidationError(`Cannot use "none" as a subcategory.`);
      return;
    }
    if (subcategoriesWithId.some((j, index2) => index !== index2 && j.value.toLowerCase() === subcategory.toLowerCase())) {
      setValidationError("Subcategory already exists.");
      return;
    }

    setValidationError("");
    setStatus("adding");

    try {
      await settingsMutateAsync({ type: "addSubcategory", workspaceId: workspace._id, category: clickedCategory, subcategory });
      setSubcategoriesWithId((prev) => prev.map((r, i) => (i === index ? { ...r, isNew: false, value: subcategory } : r))); // optimistic update
    } catch {} // error will show on UI
    setStatus("initial");
  }

  async function renameSubcategory(index: number) {
    if (!workspace || !isEdit || status !== "initial" || isPending) return;
    const from = workspace.categoryObjects.find((i) => i.category === clickedCategory)?.subcategories[index + 1];
    const to = subcategoriesWithId[index].value.trim();
    if (!from) {
      setValidationError("Unknown error.");
      return;
    }
    if (!to) {
      setSubcategoriesWithId((prev) => prev.map((j, index2) => (index2 === index ? { ...j, value: from } : j)));
      if (validationError) setValidationError("");
      return;
    }
    if (to.toLowerCase() === "none") {
      setSubcategoriesWithId((prev) => prev.map((j, index2) => (index2 === index ? { ...j, value: from } : j)));
      setValidationError(`Cannot use "none" as a subcategory.`);
      return;
    }
    if (from === to) return;
    if (
      from.toLowerCase() !== to.toLowerCase() &&
      subcategoriesWithId.some((j, index2) => index2 !== index && j.value.trim().toLowerCase() === to.toLowerCase())
    ) {
      setValidationError("Subcategories contain duplicates.");
      return;
    } // allows groceries => Groceries

    setValidationError("");
    setStatus("editing");

    try {
      await settingsMutateAsync({ type: "renameSubcategory", workspaceId: workspace._id, category: clickedCategory, from, to });
    } catch {} // error will show on UI
    setStatus("initial");
  }

  async function addSubcategoryField() {
    if (status !== "initial" || isPending) return;
    // in editing mode, can only add 1 subcategory at a time
    if (isEdit && subcategoriesWithId.some((r) => r.isNew && r.value.trim() === "")) {
      setValidationError("Please first add a subcategory above.");
      return;
    }
    setValidationError("");
    setSubcategoriesWithId((prev) => [...prev, { value: "", isNew: true }]);
  }

  return (
    <Modal title={isEdit ? "Edit Category" : "Add Category"} setModal={setAddCategoryModal} disableCloseButton={isPending}>
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
            if (validationError) setValidationError("");
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
                  if (validationError) setValidationError("");
                }}
                onBlur={isEdit ? (i.isNew ? () => addSubcategory(index) : () => renameSubcategory(index)) : undefined}
                disabled={status !== "initial" || isPending}
              />
              {isEdit && (
                <EditButtons
                  workspaceId={workspace._id}
                  setSubcategoriesWithId={setSubcategoriesWithId}
                  validationError={validationError}
                  setValidationError={setValidationError}
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
        {/*--- validation error ---*/}
        <ErrorMessage message={validationError ? validationError : isError ? error?.message : ""} />
        {/*--- button ---*/}
        {isEdit ? (
          <Button
            className="w-full"
            label="Delete"
            variant="danger"
            size="base"
            type="button"
            isLoading={status === "deleting"}
            onClick={deleteCategoryObject}
            disabled={isPending || status !== "initial"}
          />
        ) : (
          <Button
            className="w-full"
            label={isEdit ? "Save" : "Add"}
            isLoading={isPending}
            variant="primary"
            size="base"
            type="submit"
            disabled={isPending || status !== "initial"}
          />
        )}
      </form>
    </Modal>
  );
}
