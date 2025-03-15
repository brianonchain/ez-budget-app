"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import Category from "./Category";

export default function CategoryContainer({ category }: { category: { [key: string]: string[] } }) {
  // need to memoize?
  const initialItems = Object.keys(category)
    .slice(1)
    .map((i, index) => ({ id: (index + 1).toString(), text: i, subtext: category[i] }));

  // state
  const [items, setItems] = useState(initialItems);

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
            <Category key={item.id} id={item.id} text={item.text} subtext={item.subtext} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
