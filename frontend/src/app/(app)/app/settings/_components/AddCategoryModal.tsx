import { useState, useRef } from "react";
import { FaPlus } from "react-icons/fa6";
import { useSettingsMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";

export default function AddCategoryModal({ setAddCategoryModal, data }: { setAddCategoryModal: any; data: any }) {
  const categoryRef = useRef<HTMLInputElement | null>(null);
  const subcategoryRefs = useRef<HTMLInputElement[]>([]);

  const { mutateAsync: settingsMutateAsync, error, isError, isPending } = useSettingsMutation();
  const [count, setCount] = useState(2);
  const [validationError, setValidationError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // validation
    const category = categoryRef?.current?.value.trim() ?? "";
    if (!data) return;
    if (!category) {
      setValidationError("Please enter a category");
      return;
    }
    if (data.settings.categoryObjects.some((i: any) => i.category === category)) {
      setValidationError("Category already exists");
      return;
    }
    setValidationError("");

    const cleaned = Array.from(new Set(subcategoryRefs.current.map((r) => r?.value?.trim()).filter(Boolean))) as string[];
    const subcategories = ["none", ...cleaned];

    try {
      await settingsMutateAsync({ "settings.categoryObjects": [...data.settings.categoryObjects, { category, subcategories }] });
      setAddCategoryModal(false);
    } catch {
      return; // don't close modal so user sees error message
    }
  }

  return (
    <Modal title="Add A Category With Subcategories" setIsOpen={setAddCategoryModal} disableCloseButton={isPending}>
      <form onSubmit={onSubmit}>
        {/*--- category ---*/}
        <label className="block pb-1.5 inputLabel w-full">Category (e.g., utilities)</label>
        <input ref={categoryRef} className="flex-none input w-full" />
        {/*--- subcategory ---*/}
        <label className="block mt-6 pb-1.5 inputLabel w-full">Subcategories (e.g., phone, electricity)</label>
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, index) => (
            <input
              ref={(el) => {
                if (el) subcategoryRefs.current[index] = el;
              }}
              key={index}
              className="input w-full"
            />
          ))}
        </div>
        {/*--- more subcategory fields ---*/}
        <button className="mt-4 link flex items-center justify-center gap-1" type="button" onClick={() => setCount(count + 1)}>
          <FaPlus />
          More Subcategory Fields
        </button>
        {/*--- button ---*/}
        <button className="mt-12 button1 w-full" type="submit">
          {isPending ? "Adding..." : "Add"}
        </button>
      </form>
      <div className="errorText mt-5 desktop:mt-3 min-h-[1.3rem]">{validationError ? validationError : isError ? error?.message : ""}</div>
    </Modal>
  );
}
