"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LuGripVertical } from "react-icons/lu";

export default function Tags({
  id,
  tag,
  setAddTagModal,
  setClickedTag,
}: {
  id: string;
  tag: string;
  setAddTagModal: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedTag: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="settingsDraggableElement"
      onClick={() => {
        setClickedTag(tag);
        setAddTagModal(true);
      }}
      aria-label={`Edit tag ${tag}`}
    >
      <div>
        <p className="font-medium leading-tight line-clamp-1">{tag}</p>
      </div>
      <LuGripVertical className="text-lg desktop:text-sm" />
    </button>
  );
}
