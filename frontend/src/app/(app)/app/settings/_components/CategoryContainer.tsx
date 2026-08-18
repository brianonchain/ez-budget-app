"use client";
import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
// components
import Category from "./Category";
// utils
import { CategoryObject } from "@/db/WorkspaceModel";
import { useWorkspaceMutation } from "@/utils/hooks";

function addId(categoryObjects: CategoryObject[]) {
  return categoryObjects.slice(1).map((i, index) => ({ id: (index + 1).toString(), ...i }));
}

export default function CategoryContainer({
  categoryObjects,
  setAddCategoryModal,
  setClickedCategory,
  workspaceId,
}: {
  categoryObjects: CategoryObject[];
  setAddCategoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedCategory: React.Dispatch<React.SetStateAction<string | null>>;
  workspaceId: string;
}) {
  const { mutateAsync: mutateWorkspaceAsync } = useWorkspaceMutation();

  const [items, setItems] = useState(() => addId(categoryObjects));

  // needed if user adds new category
  useEffect(() => {
    setItems(addId(categoryObjects));
  }, [categoryObjects]);

  // Set up sensors for better drag handling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
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
      await mutateWorkspaceAsync({ type: "reorderCategoryObjects", workspaceId, categoryObjects: newCategoryObjects });
    } catch (e) {
      console.error("Failed to update category order");
      setItems(oldItems);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="w-full flex flex-col textXs divide-y divide-dashed divide-borderFaint">
          {items.map((item, index) => (
            <Category
              key={item.id}
              id={item.id}
              category={item.category}
              subcategories={item.subcategories}
              setAddCategoryModal={setAddCategoryModal}
              setClickedCategory={setClickedCategory}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
