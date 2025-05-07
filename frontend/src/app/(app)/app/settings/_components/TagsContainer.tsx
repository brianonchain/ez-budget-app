"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import Tags from "./Tags";
import { useSettingsMutation } from "@/utils/hooks";

function addId(_tags: string[]) {
  return _tags.slice(1).map((i, index) => ({ id: (index + 1).toString(), tag: i }));
}

export default function TagsContainer({ tags }: { tags: string[] }) {
  // hooks
  const { mutateAsync: settingsMutateAsync } = useSettingsMutation();
  // state
  const [items, setItems] = useState(() => addId(tags));
  // useEffects
  useEffect(() => {
    setItems(addId(tags)); // needed if user adds new tag
  }, [tags]);

  // Set up sensors for better drag handling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const oldItems = [...items];
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    const newTags = ["none"];
    newItems.forEach((i) => newTags.push(i.tag));

    try {
      await settingsMutateAsync({ "settings.tags": newTags });
    } catch (e) {
      console.error("Failed to update tag order");
      setItems(oldItems);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="w-[90%] flex flex-col text-base desktop:text-xs border-t border-b border-dashed borderColorFaint">
          {items.map((item) => (
            <Tags key={item.id} id={item.id} tag={item.tag} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
