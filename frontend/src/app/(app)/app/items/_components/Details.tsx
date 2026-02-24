import { useState, useMemo } from "react";
import { Item } from "@/db/UserModel";
import { useItemsMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
import Button from "@/utils/components/Button";
import { CategoryObject } from "@/db/UserModel";
import DetailsCalendar from "./DetailsCalendar";

export default function Details({
  data,
  newItem,
  setNewItem,
  setDetailsModal,
}: {
  data: any;
  newItem: Item;
  setNewItem: React.Dispatch<React.SetStateAction<Item>>;
  setDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // store selected category object in memo
  const selectedCategoryObject = useMemo(() => {
    return data.settings.categoryObjects.find((i: CategoryObject) => i.category === newItem.category) ?? data.settings.categoryObjects[0];
  }, [data.settings.categoryObjects, newItem.category]);

  // states
  const { mutateAsync: mutateItemsAsync, isPending, isError, error } = useItemsMutation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [costString, setCostString] = useState(newItem.cost ? newItem.cost.toString() : "");
  const [status, setStatus] = useState<"initial" | "addingOrEditing" | "deleting">("initial"); // need status because we have 2 buttons; tanstack query isPending not enough

  const onAddOrEdit = async () => {
    const nextItem = { ...newItem, cost: costString ? Number(costString) : 0 };
    setStatus("addingOrEditing");
    try {
      await mutateItemsAsync({ op: "upsert", item: nextItem });
      setDetailsModal(false);
    } catch {
      setStatus("initial");
    }
  };

  const onDelete = async () => {
    console.log("newItem", newItem);
    if (!newItem._id) return;
    setStatus("deleting");
    try {
      await mutateItemsAsync({ op: "delete", itemId: String(newItem._id) });
      setDetailsModal(false);
    } catch {
      setStatus("initial");
    }
  };

  return (
    <Modal title="Item Info" setIsOpen={setDetailsModal}>
      <div className="mx-auto w-full max-w-[400px] h-full min-h-0 flex flex-col">
        {/*--- date, name, cost ---*/}
        <div className="shrink-0 w-full grid grid-cols-[auto_1fr] gap-y-[6px] gap-x-[12px] items-center">
          <label className="inputLabel" htmlFor="details-date">
            Date
          </label>
          <div className="relative z-[200]">
            <button
              id="details-date"
              className="relative z-[1] inputSmall flex items-center cursor-pointer"
              onClick={() => setShowCalendar(true)}
            >
              {new Date(newItem.date).toLocaleString("en-US")}
            </button>
            {showCalendar && <DetailsCalendar setShowCalendar={setShowCalendar} newItem={newItem} setNewItem={setNewItem} />}
          </div>

          <label className="inputLabel" htmlFor="details-desc">
            Item
          </label>
          <input
            id="details-desc"
            className="inputSmall"
            value={newItem.description}
            onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.currentTarget.value }))}
          />
          <label className="inputLabel" htmlFor="details-cost">
            Cost
          </label>
          <input
            id="details-cost"
            className="inputSmall !w-[100px]"
            value={newItem.cost.toString()}
            onChange={(e) => {
              if (/^\d*\.?\d*$/.test(e.currentTarget.value)) {
                setCostString(e.currentTarget.value);
              }
            }}
            onBlur={() => setNewItem((prev) => ({ ...prev, cost: costString ? Number(costString) : 0 }))}
            inputMode="decimal"
          />
        </div>

        {/*--- label options ---*/}
        <div className="flex-1 min-h-[200px] mt-[20px] w-full grid grid-cols-3 gap-[6px]">
          {/*--- Category ---*/}
          <div className="min-h-0 flex flex-col">
            <p className="text-center inputLabel">Category</p>
            <div className="flex-1 min-h-0 detailsLabelContainer overflow-y-auto thinScrollbar">
              {data.settings.categoryObjects.map((i: CategoryObject) => (
                <div
                  key={i.category}
                  className={`detailsLabel ${
                    newItem.category === i.category
                      ? "!bg-lightButton1Bg dark:!bg-darkButton1Bg text-lightButton1Text dark:text-darkButton1Text"
                      : ""
                  } `}
                  onClick={() => setNewItem((prev) => ({ ...prev, category: i.category, subcategory: "none" }))}
                >
                  {i.category}
                </div>
              ))}
            </div>
          </div>
          {/*--- Subcategory ---*/}
          <div className="min-h-0 flex flex-col overflow-hidden">
            <p className="text-center inputLabel">Subcategory</p>
            <div className="detailsLabelContainer thinScrollbar">
              {selectedCategoryObject.subcategories.map((i: string) => (
                <div
                  key={i}
                  className={`detailsLabel ${
                    i === newItem.subcategory
                      ? "!bg-lightButton1Bg dark:!bg-darkButton1Bg text-lightButton1Text dark:text-darkButton1Text"
                      : ""
                  } `}
                  onClick={() => setNewItem((prev) => ({ ...prev, subcategory: i }))}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>
          {/*--- Tags ---*/}
          <div className="min-h-0 flex flex-col overflow-hidden">
            <p className="text-center inputLabel">Tags</p>
            <div className="detailsLabelContainer thinScrollbar">
              {data.settings.tags.map((i: string) => (
                <div
                  key={i}
                  className={`detailsLabel ${
                    newItem.tags === i ? "!bg-lightButton1Bg dark:!bg-darkButton1Bg text-lightButton1Text dark:text-darkButton1Text" : ""
                  } `}
                  onClick={() => setNewItem((prev) => ({ ...prev, tags: i }))}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*--- button ---*/}
        <div className="shrink-0 mt-[20px]">
          <Button
            label={newItem._id ? "Save Changes" : "Add Item"}
            onClick={onAddOrEdit}
            isLoading={status === "addingOrEditing"}
            disabled={status !== "initial" || isPending}
            type="button"
          />
          {isError && <div className="errorText mt-5 desktop:mt-3 min-h-[1.3rem]">{error?.message}</div>}
          {newItem._id && (
            <Button
              className="mt-[40px] buttonRed"
              label="Delete Item"
              onClick={onDelete}
              isLoading={status === "deleting"}
              disabled={status !== "initial" || isPending}
              type="button"
            >
              {status === "deleting" ? "Deleting..." : "Delete Item"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
