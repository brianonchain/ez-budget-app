"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SlMenu } from "react-icons/sl";

export default function Category({
  id,
  category,
  subcategories,
  setAddCategoryModal,
  setClickedCategory,
}: {
  id: string;
  category: string;
  subcategories: string[];
  setAddCategoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedCategory: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="settingsDraggableElement"
      onClick={() => {
        setClickedCategory(category);
        setAddCategoryModal(true);
      }}
      type="button"
      aria-label={`Edit category ${category}`}
    >
      <div className="min-w-0 text-left">
        <p className="font-medium leading-tight truncate">{category}</p>
        <p className="italic leading-tight truncate">{subcategories.slice(1).join(", ")}</p>
      </div>
      <SlMenu className="flex-none text-lg desktop:text-sm" />
    </button>
  );
}
