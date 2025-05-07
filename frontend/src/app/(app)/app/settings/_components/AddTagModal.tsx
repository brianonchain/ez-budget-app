import React from "react";
import { FaPlus } from "react-icons/fa6";
import { useSettingsMutation, useUserQuery } from "@/utils/hooks";

export default function AddTagModal({ setAddTagModal, data }: { setAddTagModal: any; data: any }) {
  const { mutateAsync: settingsMutateAsync } = useSettingsMutation();

  return (
    <div>
      <div className="modalFull">
        {/*--- close ---*/}
        <div className="xButton" onClick={() => setAddTagModal(false)}>
          &#10005;
        </div>
        {/*--- title ---*/}
        <div className="modalFullHeader">Add A Tag</div>
        {/*--- content ---*/}
        <div className="modalFullContentContainer">
          {/*--- tags ---*/}
          <p className="mt-[16px] w-full inputLabel">Tags (e.g., Euro Trip 2025, Winnie's birthday)</p>
          <input className="mt-[4px] w-full input" data-type="tags" />
          {/*--- button ---*/}
          <button
            onClick={() => {
              const tagValue = document.querySelector<HTMLInputElement>('input[data-type="tags"]')?.value as string;
              if (data && tagValue) {
                settingsMutateAsync({ changes: { "settings.tags": [...data.settings.tags, tagValue] } });
                setAddTagModal(false);
              }
            }}
            className="my-[24] button1 w-full"
          >
            Add
          </button>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
