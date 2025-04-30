"use client";
// next
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
// others
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
// images
import { ImSpinner2 } from "react-icons/im";

// images
import { FaPlus, FaX, FaAngleLeft } from "react-icons/fa6";
import { TbEdit } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { AiOutlineEdit } from "react-icons/ai";
// components
import PasswordModal from "./_components/PasswordModal";
import CategoryContainer from "./_components/CategoryContainer";
import TagsContainer from "./_components/TagsContainer";
// utils
import { useSettingsMutation, useUserQuery } from "@/utils/hooks";
import Toggle from "@/utils/components/Toggle";
import ErrorModal from "@/utils/components/ErrorModal";

export default function Settings() {
  // hooks
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const { data: session } = useSession();

  // react query
  const { data, isPending, isError } = useUserQuery(session?.user?.email);
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
  const [isSigningOut, setIsSigningOut] = useState(false);

  // useEffect(() => {
  //   if (isError) setErrorModal("Unable to fetch you data. Refresh app or re-login. We apologize for the inconvenience.");
  // }, [isError]);

  // double container needed so scrollbar hugs right edge of screen
  return (
    <div className="appPageContainer overflow-y-auto overflow-hidden relative z-0 focus:outline-none">
      {/*--- background glow ---*/}
      <div className="absolute w-full h-full left-0 top-0 z-[-1]">
        <div className="absolute top-1/2 right-0 translate-y-[-50%] translate-x-[50%] w-[90%] h-[50%] rounded-full bg-white dark:bg-[#0444B7] blur-[200px] portrait:sm:dark:blur-[300px] landscape:lg:blur-[300px] pointer-events-none"></div>
      </div>

      <div className="pb-[50px] w-[94%] max-w-[400px] flex flex-col items-center">
        {/*--- title ---*/}
        <div className="settingsTitle">Settings</div>
        {/*--- email ---*/}
        <div className="settingsField">
          <p className="settingsLabel">Email</p>
          <div className="flex items-center gap-[8px]">
            <p className="font-medium">{data?.settings.email}</p>
            <AiOutlineEdit className="settingsEditIcon" onClick={() => setEmailModal(true)} />
          </div>
        </div>
        {/*--- password ---*/}
        <div className="settingsField border-b-[1.5px]">
          <p className="settingsLabel">Password</p>
          <div className="flex items-center gap-[8px]">
            {"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
            <AiOutlineEdit className="settingsEditIcon" onClick={() => setPasswordModal(true)} />
          </div>
        </div>

        {/*--- categories ---*/}
        <div className="pt-[24px] pb-[12px] w-full flex items-center gap-[16px]">
          <p className="settingsLabel">Categories</p>
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
          <p className="settingsLabel">Tags</p>
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
        {/*--- DISPLAY  ---*/}
        <div className="settingsTitle">Display</div>
        {/*---DARK MODE ---*/}
        <div className="settingsField border-b-[1.5px]">
          <label className="">Dark</label>
          <Toggle
            checked={resolvedTheme === "dark" ? true : false}
            onClick={() => {
              if (resolvedTheme === "dark") {
                setTheme("light");
                window.localStorage.setItem("theme", "light");
              } else {
                setTheme("dark");
                window.localStorage.setItem("theme", "dark");
              }
            }}
          />
        </div>
        {/*---Sign Out---*/}
        <button
          className="button1RoundNoWidth w-[120px] desktop:w-[90px] mx-auto my-[48px]"
          onClick={() => {
            setIsSigningOut(true);
            signOut({ callbackUrl: "/login" });
          }}
          type="button"
          disabled={isSigningOut}
        >
          {isSigningOut ? <ImSpinner2 className="animate-spin text-[24px]" /> : "Sign Out"}
        </button>
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
              <p className="mt-[16px] inputLabel w-full">Category (e.g., food)</p>
              <input className="input w-full" data-type="category" />
              {/*--- subcategory ---*/}
              <p className="mt-[16px] inputLabel w-full">Subcategories (e.g., eating out, groceries)</p>
              <div className="w-full flex flex-col gap-[8px]">
                {Array.from({ length: count }).map((_, index) => (
                  <input key={index} className="input w-full" data-type="subcategory" />
                ))}
              </div>
              {/*--- more subcategory fields ---*/}
              <div className="my-[16px] link flex items-center justify-center gap-[4px]" onClick={() => setCount(count + 1)}>
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
              <p className="mt-[16px] w-full inputLabel">Tags (e.g., Euro Trip 2025, Winnie's birthday)</p>
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
                className="my-[24] button1 w-full"
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
