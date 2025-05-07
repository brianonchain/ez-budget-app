"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import Category from "./Category";
import { CategoryObject } from "@/db/UserModel";
import { useSettingsMutation } from "@/utils/hooks";

function addId(categoryObjects: CategoryObject[]) {
  return categoryObjects.slice(1).map((i, index) => ({ id: (index + 1).toString(), ...i }));
}

export default function CategoryContainer({ categoryObjects, setAddCategoryModal }: { categoryObjects: CategoryObject[]; setAddCategoryModal: any }) {
  const { mutateAsync: settingsMutateAsync } = useSettingsMutation();

  const [items, setItems] = useState(() => addId(categoryObjects));

  // needed if user adds new category
  useEffect(() => {
    setItems(addId(categoryObjects));
  }, [categoryObjects]);

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

    const newCategoryObjects = [{ category: "none", subcategories: ["none"] }];
    newItems.forEach((i) => newCategoryObjects.push({ category: i.category, subcategories: i.subcategories }));

    try {
      await settingsMutateAsync({ "settings.categoryObjects": newCategoryObjects });
    } catch (e) {
      console.error("Failed to update category order");
      setItems(oldItems);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="w-[90%] flex flex-col textXsApp border-t border-b border-dashed borderColorFaint">
          {items.map((item, index) => (
            <Category key={item.id} id={item.id} category={item.category} subcategories={item.subcategories.slice(1).join(", ")} setAddCategoryModal={setAddCategoryModal} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
