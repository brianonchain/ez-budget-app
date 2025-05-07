import { useState, useRef } from "react";
import { FaPlus } from "react-icons/fa6";
import { useSettingsMutation } from "@/utils/hooks";

export default function AddCategoryModal({ setAddCategoryModal, data }: { setAddCategoryModal: any; data: any }) {
  const categoryRef = useRef<HTMLInputElement | null>(null);
  const subcategoryRefs = useRef<HTMLInputElement[]>([]);

  const { mutateAsync: settingsMutateAsync } = useSettingsMutation();
  const [count, setCount] = useState(2);
  const [error, setError] = useState("");

  return (
    <div>
      <div className="modalFull">
        {/*--- close ---*/}
        <div className="xButton" onClick={() => setAddCategoryModal(false)}>
          &#10005;
        </div>
        {/*--- title ---*/}
        <div className="modalFullHeader">Add A Category With Subcategories</div>
        {/*--- content ---*/}
        <div className="modalFullContentContainer">
          {/*--- category ---*/}
          <label className="inputLabel w-full">Category (e.g., utilities)</label>
          <input ref={categoryRef} className="input w-full" />
          {/*--- subcategory ---*/}
          <label className="mt-4 inputLabel w-full">Subcategories (e.g., phone, electricity)</label>
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, index) => (
              <input
                ref={(el) => {
                  subcategoryRefs.current[index] = el!;
                }}
                key={index}
                className="input w-full"
              />
            ))}
          </div>
          {/*--- more subcategory fields ---*/}
          <div className="mt-4 link flex items-center justify-center gap-1" onClick={() => setCount(count + 1)}>
            <FaPlus />
            More Subcategory Fields
          </div>
          {/*--- button ---*/}
          <button
            onClick={() => {
              const categoryValue = categoryRef?.current?.value.trim();
              if (categoryValue) {
                setError("");
                const subcategories: string[] = ["none"];
                subcategoryRefs.current.forEach((ref) => {
                  const subcategoryValue = ref?.value?.trim();
                  if (subcategoryValue) subcategories.push(subcategoryValue);
                });
                settingsMutateAsync({ changes: { "settings.category": { ...data?.settings.category, [categoryValue]: subcategories } } });
                setAddCategoryModal(false);
              } else {
                setError("Please enter a category");
              }
            }}
            className="mt-12 button1 w-full"
          >
            Add
          </button>
          {error && <p className="errorText mt-2">{error}</p>}
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
