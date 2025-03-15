"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import Tags from "./Tags";

export default function TagsContainer({ tags }: { tags: string[] }) {
  // state
  const [items, setItems] = useState(() => tags.slice(1).map((i, index) => ({ id: (index + 1).toString(), text: i })));

  // Set up sensors for better drag handling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    setItems(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="w-[100%] flex flex-col text-base desktop:text-xs border-t border-b border-dashed border-slate-300">
          {items.map((item) => (
            <Tags key={item.id} id={item.id} text={item.text} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
