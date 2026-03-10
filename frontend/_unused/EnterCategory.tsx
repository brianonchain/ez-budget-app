// @ts-nocheck
import Header from "./Header";
import { useState } from "react";
import { useItemsMutation } from "@/utils/hooks";
import Button from "@/utils/components/Button";
import { DraftItem } from "@/utils/types";

export default function EnterCategory({
  setPage,
  data,
  draftItem,
  setDraftItem,
}: {
  setPage: any;
  data: any;
  draftItem: DraftItem;
  setDraftItem: any;
}) {
  const { mutateAsync: mutateItemsAsync, isPending } = useItemsMutation();

  const [labelType, setLabelType] = useState<keyof DraftItem>("category");
  const [labelOptions, setLabelOptions] = useState(Object.keys(data.workspace.category));

  return (
    <>
      <Header text="Choose Labels" setPage={setPage} page="list" />

      {/*--- label type ---*/}
      <div className="w-[350px] grid grid-cols-3 gap-[4px]">
        {(["category", "subcategory", "tags"] as const).map((i: keyof Item, index) => (
          <div
            key={index}
            className={`${
              labelType === i ? "bg-buttong1Bg text-white" : ""
            } p-[8px] desktop:p-[4px] h-[64px] desktop:h-[52px] flex flex-col justify-between border-2 border-button1Bg rounded-lg relative desktop:cursor-pointer desktop:hover:bg-button1Bg desktop:hover:text-white`}
            onClick={() => {
              setLabelType(i);
              if (i === "category") {
                setLabelOptions(Object.keys(data.workspace.category));
              } else if (i === "subcategory") {
                setLabelOptions(data.workspace.category[draftItem.category]);
              } else if (i === "tags") {
                setLabelOptions(data.workspace.tags);
              }
            }}
          >
            <p className="text-base desktop:text-sm font-medium text-center">{i.charAt(0).toUpperCase() + i.slice(1)}</p>
            <p className="text-sm text-center tracking-tighter truncate">{draftItem[i]}</p>
            <div
              className={`${
                labelType === i ? "" : "invisible"
              } absolute top-[calc(100%+12px)] left-[36px] w-[40px] h-[40px] rotate-45 bg-slate-200 dark:bg-[#251e51]`}
            ></div>
          </div>
        ))}
      </div>

      {/*--- label choices ---*/}
      <div className="grow mt-[20px] py-[20px] w-[350px] flex justify-center overflow-hidden bg-slate-200 dark:bg-[#251e51] rounded-lg relative">
        <div className="w-full px-[20px] h-full flex flex-col gap-[4px] overflow-y-auto thinScrollbar">
          {labelOptions.map((i, index) => (
            <div
              key={index}
              className={`${
                draftItem[labelType] === i ? "border-button1Bg" : "border-slate-300 dark:border-transparent"
              } flex-none px-[12px] w-full h-[56px] desktop:h-[40px] flex items-center justify-between  font-medium border-2 rounded-lg desktop:cursor-pointer bg-white dark:bg-blue-100/10 desktop:hover:border-button1Bg`}
              onClick={() => {
                if (labelType === "category") {
                  setLabelType("subcategory");
                  setLabelOptions(data.workspace.category[i]);
                  setDraftItem({ ...draftItem, category: i, subcategory: "none" });
                } else if (labelType === "subcategory") {
                  setLabelType("tags");
                  setLabelOptions(data.workspace.tags);
                  setDraftItem({ ...draftItem, [labelType]: i });
                } else if (labelType === "tags") {
                  setDraftItem({ ...draftItem, [labelType]: i });
                }
              }}
            >
              <p>{i.charAt(0).toUpperCase() + i.slice(1)}</p>
            </div>
          ))}
        </div>
      </div>

      {/*--- button ---*/}
      <div className="flex-none pb-[40px]">
        <Button
          className="w-[350px]"
          label={isPending ? "Adding..." : "Done"}
          onClick={async () => {
            const date = new Date();
            const newItemTemp = { ...draftItem, date };
            await mutateItemsAsync(newItemTemp);
            setPage("list");
          }}
          disabled={isPending}
        />
      </div>
    </>
  );
}
