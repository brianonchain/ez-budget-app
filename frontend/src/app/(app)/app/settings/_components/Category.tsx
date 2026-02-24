"use client";

import { CategoryObject } from "@/db/UserModel";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiMenu } from "react-icons/fi";
import { SlMenu } from "react-icons/sl";

export default function Category({
  id,
  category,
  subcategories,
  setAddCategoryModal,
  setClickedCategoryObject,
}: {
  id: string;
  category: string;
  subcategories: string[];
  setAddCategoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedCategoryObject: React.Dispatch<React.SetStateAction<CategoryObject | null>>;
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
      className={`px-[4px] h-[52px] desktop:h-[40px] flex items-center justify-between border-t border-b border-dashed borderColorFaint desktop:cursor-pointer desktop:hover:text-slate-400`}
      onClick={() => {
        setClickedCategoryObject({ category, subcategories });
        setAddCategoryModal(true);
      }}
    >
      <div className="">
        <p className="font-medium leading-tight line-clamp-1">{category}</p>
        <p className="italic leading-tight line-clamp-1">{subcategories.slice(1).join(", ")}</p>
      </div>
      <SlMenu className="text-[18px] desktop:text-[14px]" />
    </div>
  );
}
