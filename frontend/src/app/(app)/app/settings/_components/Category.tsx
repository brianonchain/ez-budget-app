"use client";

import { useDndContext } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LuGripVertical } from "react-icons/lu";

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
  const { active } = useDndContext();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

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
      className={`settingsDraggableElement ${isDragging ? "bg-buttonOutlineBgHover" : ""} ${active && !isDragging ? "hover:!bg-transparent" : ""}`}
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
      <LuGripVertical className="flex-none text-lg desktop:text-sm" />
    </button>
  );
}
