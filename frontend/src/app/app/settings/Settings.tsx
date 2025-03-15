"use client";
import { useState, useEffect, useRef } from "react";
import { useSettingsMutation, useUserQuery } from "@/utils/hooks";
import ErrorModal from "@/utils/components/ErrorModal";
import PasswordModal from "./_components/PasswordModal";
import { FaPlus, FaX, FaAngleLeft } from "react-icons/fa6";
import { TbEdit } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { AiOutlineEdit } from "react-icons/ai";

import CategoryContainer from "./_components/CategoryContainer";
import TagsContainer from "./_components/TagsContainer";

export default function Settings() {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  // react query
  const { data, isPending, isError } = useUserQuery();
  const { mutateAsync: settingsMutateAsync } = useSettingsMutation();
  // states
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [mask, setMask] = useState(true);
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [addTagsModal, setAddTagsModal] = useState(false);
  const [newCategory, setNewCategory] = useState<{ [key: string]: string } | null>(null);
  const [newTags, setNewTags] = useState<string[] | null>(null);
  const [count, setCount] = useState(2);

  // useEffect(() => {
  //   if (isError) setErrorModal("Unable to fetch you data. Refresh app or re-login. We apologize for the inconvenience.");
  // }, [isError]);

  // double container needed so scrollbar hugs right edge of screen
  return (
    <div className="appPageContainer overflow-y-auto text-base desktop:text-sm">
      <div className="pb-[50px] w-[94%] max-w-[400px] flex flex-col items-center">
        {/*--- title ---*/}
        <div className="flex-none mt-[8px] h-[64px] desktop:h-[90px] flex items-center justify-center text-2xl font-bold text-light-button1">Settings</div>
        {/*--- email ---*/}
        <div className="settingsField">
          <p className="settingsLabelFont">Email</p>
          <div className="flex items-center gap-[8px]">
            <p className="font-medium text-slate-800">{data?.settings.email}</p>
            <AiOutlineEdit className="settingsEditIcon" onClick={() => setEmailModal(true)} />
          </div>
        </div>
        {/*--- password ---*/}
        <div className="settingsField border-b-[1.5px]">
          <p className="settingsLabelFont">Password</p>
          <div className="flex items-center gap-[8px] text-slate-800">
            {"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
            <AiOutlineEdit className="settingsEditIcon" onClick={() => setPasswordModal(true)} />
          </div>
        </div>

        {/*--- categories ---*/}
        <div className="pt-[24px] pb-[12px] w-full flex items-center gap-[16px]">
          <p className="settingsLabelFont">Categories</p>
          <button className="buttonSettings" onClick={() => setAddCategoryModal(true)}>
            <FaPlus /> New
          </button>
        </div>
        {/*--- category options ---*/}
        {data && Object.keys(data.settings.category).length > 1 ? (
          <CategoryContainer category={data?.settings.category} key={JSON.stringify(data?.settings.category)} />
        ) : (
          <div className="text-center text-slate-500 italic">No categories</div>
        )}

        {/*--- tags ---*/}
        <div className="pt-[24px] pb-[12px] w-full flex items-center gap-[16px]">
          <p className="settingsLabelFont">Tags</p>
          <button className="buttonSettings" onClick={() => setAddTagsModal(true)}>
            <FaPlus /> New
          </button>
        </div>
        {/*--- tag options ---*/}
        {data && data.settings.tags.length > 1 ? (
          <TagsContainer tags={data?.settings.tags} key={JSON.stringify(data?.settings.tags)} />
        ) : (
          <div className="text-center text-slate-500 italic">No tags</div>
        )}
      </div>

      {passwordModal && <PasswordModal setPasswordModal={setPasswordModal} />}

      {addCategoryModal && (
        <div>
          <div className="modalFull">
            {/*--- close ---*/}
            <div className="xButton" onClick={() => setAddCategoryModal(false)}>
              &#10005;
            </div>
            {/*--- title ---*/}
            <div className="modalFullHeader">Add A Category With Subcategories</div>
            {/*--- content ---*/}
            <div className="modalFullContentContainer">
              {/*--- category ---*/}
              <p className="mt-[16px] w-full label !font-medium">Category (e.g., food)</p>
              <input className="input w-full" data-type="category" />
              {/*--- subcategory ---*/}
              <p className="mt-[16px] w-full label !font-medium">Subcategories (e.g., eating out, groceries)</p>
              <div className="w-full flex flex-col gap-[8px]">
                {Array.from({ length: count }).map((_, index) => (
                  <input key={index} className="input w-full" data-type="subcategory" />
                ))}
              </div>
              {/*--- more subcategory fields ---*/}
              <div className="my-[16px] link flex items-center justify-center gap-[4px] text-lg desktop:text-sm" onClick={() => setCount(count + 1)}>
                <FaPlus />
                More Subcategory Fields
              </div>
              {/*--- button ---*/}
              <button
                onClick={() => {
                  const categoryValue = document.querySelector<HTMLInputElement>('input[data-type="category"]')?.value as string;
                  if (categoryValue) {
                    let subcategory: string[] = ["none"];
                    const elements = document.querySelectorAll<HTMLInputElement>('input[data-type="subcategory"]');
                    elements.forEach((i) => {
                      if (i.value) subcategory.push(i.value);
                    });
                    settingsMutateAsync({ changes: { "settings.category": { ...data?.settings.category, [categoryValue]: subcategory } } });
                    setAddCategoryModal(false);
                  }
                }}
                className="mt-[40px] mb-[20px] button1 w-full"
              >
                Add
              </button>
            </div>
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}

      {addTagsModal && (
        <div>
          <div className="modalFull">
            {/*--- close ---*/}
            <div className="xButton" onClick={() => setAddTagsModal(false)}>
              &#10005;
            </div>
            {/*--- title ---*/}
            <div className="modalFullHeader">Add A Tag</div>
            {/*--- content ---*/}
            <div className="modalFullContentContainer">
              {/*--- tags ---*/}
              <p className="mt-[16px] w-full font-semibold">Tags (e.g., Euro Trip 2025, Winnie's birthday)</p>
              <input className="mt-[4px] w-full input" data-type="tags" />
              {/*--- button ---*/}
              <button
                onClick={() => {
                  const tagValue = document.querySelector<HTMLInputElement>('input[data-type="tags"]')?.value as string;
                  if (data && tagValue) {
                    settingsMutateAsync({ changes: { "settings.tags": [...data.settings.tags, tagValue] } });
                    setAddTagsModal(false);
                  }
                }}
                className="my-[24] button1 text-lg desktop:text-sm w-full"
              >
                Add
              </button>
            </div>
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}
    </div>
  );
}
