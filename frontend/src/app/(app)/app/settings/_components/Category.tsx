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
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="settingsDraggableElement"
      onClick={() => {
        setClickedCategory(category);
        setAddCategoryModal(true);
      }}
    >
      <div>
        <p className="font-medium leading-tight line-clamp-1">{category}</p>
        <p className="italic leading-tight line-clamp-1">{subcategories.slice(1).join(", ")}</p>
      </div>
      <SlMenu className="flex-none text-lg desktop:text-sm" />
    </div>
  );
}
