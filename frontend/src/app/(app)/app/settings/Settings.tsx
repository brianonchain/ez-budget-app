"use client";
// next
import { useState } from "react";
// others
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
// images
import { FaPlus } from "react-icons/fa6";
import { AiOutlineEdit } from "react-icons/ai";
import { ImSpinner2 } from "react-icons/im";
// components
import PasswordModal from "./_components/PasswordModal";
import EmailModal from "./_components/EmailModal";
import AddCategoryModal from "./_components/AddCategoryModal";
import AddTagModal from "./_components/AddTagModal";
import CategoryContainer from "./_components/CategoryContainer";
import TagsContainer from "./_components/TagsContainer";
// utils
import { capitalizeFirst } from "@/utils/functions";
import { useUserQuery } from "@/utils/hooks";
import Toggle from "@/utils/components/Toggle";

export default function Settings({ provider, email }: { provider: string; email: string }) {
  // hooks
  const { resolvedTheme, setTheme } = useTheme();
  const { data, isPending, isError } = useUserQuery(email);
  console.log("Settings.tsx, data", data);

  // states
  const [passwordModal, setPasswordModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [addTagModal, setAddTagModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // double container needed so scrollbar hugs right edge of screen
  return (
    <div className="appPageContainer overflow-x-hidden overflow-y-auto relative z-0" style={{ scrollbarGutter: "stable" }}>
      {/*--- glow ---*/}
      <div className="absolute w-full h-full left-0 top-0 z-[-1]">
        <div className="absolute top-1/2 right-0 translate-y-[-50%] translate-x-[50%] w-[90%] h-[50%] rounded-full bg-white dark:bg-[#0444B7] blur-[200px] portrait:sm:dark:blur-[300px] landscape:lg:blur-[300px] pointer-events-none"></div>
      </div>

      <div className="pb-[50px] w-full max-w-[500px] desktop:max-w-[420px] flex flex-col items-center">
        <div className="settingsCard">
          <div className="settingsTitle">Settings</div>
          {/*--- email ---*/}
          <div className="settingsField">
            <p className="settingsLabel">Email</p>
            <div className="flex items-center gap-2 overflow-hidden">
              <p className="grow font-medium truncate">{email}</p>
              {provider === "credentials" && <AiOutlineEdit className="settingsEditIcon" onClick={() => setEmailModal(true)} />}
            </div>
          </div>
          {/*--- password ---*/}
          {provider === "credentials" ? (
            <div className="settingsField">
              <p className="settingsLabel">Password</p>
              <div className="flex items-center gap-2">
                {"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                <AiOutlineEdit className="settingsEditIcon" onClick={() => setPasswordModal(true)} />
              </div>
            </div>
          ) : (
            <div className="settingsField">
              <p className="settingsLabel">Login Method</p>
              <div className="font-medium">{capitalizeFirst(provider)}</div>
            </div>
          )}

          {/*--- categories ---*/}
          <div className="py-4 w-full flex flex-col items-center gap-4 border-b-[1.5px] borderColor">
            <div className="w-full flex items-center gap-4">
              <p className="settingsLabel">Categories</p>
              <button className="buttonSettings" onClick={() => setAddCategoryModal(true)}>
                <FaPlus /> New
              </button>
            </div>
            {/*--- category options ---*/}
            {data ? (
              data.settings.categoryObjects.length > 1 ? (
                <CategoryContainer categoryObjects={data.settings.categoryObjects} setAddCategoryModal={setAddCategoryModal} />
              ) : (
                <div className="text-center text-slate-500 italic">No categories</div>
              )
            ) : (
              <div className="w-[90%] bg-blue-300/10 animate-pulse rounded-lg text-transparent point-events-none">0</div>
            )}
          </div>

          {/*--- tags ---*/}
          <div className="py-4 w-full flex flex-col items-center gap-4">
            <div className="w-full flex items-center gap-4">
              <p className="settingsLabel">Tags</p>
              <button className="buttonSettings" onClick={() => setAddTagModal(true)}>
                <FaPlus /> New
              </button>
            </div>
            {/*--- tag options ---*/}
            {data ? (
              data.settings.tags.length > 1 ? (
                <TagsContainer tags={data?.settings.tags} key={JSON.stringify(data?.settings.tags)} />
              ) : (
                <div className="text-center text-slate-500 italic">No tags</div>
              )
            ) : (
              <div className="w-[90%] bg-blue-300/10 animate-pulse rounded-lg text-transparent point-events-none">0</div>
            )}
          </div>
        </div>

        {/*--- DISPLAY  ---*/}
        <div className="settingsCard">
          <div className="settingsTitle">Display</div>
          {/*---DARK MODE ---*/}
          <div className="settingsField border-none">
            <label className="settingsLabel">Dark</label>
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
        </div>

        {/*---Sign Out---*/}
        <button
          className="button1Round w-[7em] mx-auto my-12"
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

      {passwordModal && <PasswordModal setPasswordModal={setPasswordModal} email={email} />}
      {emailModal && <EmailModal setEmailModal={setEmailModal} email={email} />}
      {addCategoryModal && <AddCategoryModal setAddCategoryModal={setAddCategoryModal} data={data} />}
      {addTagModal && <AddTagModal setAddTagModal={setAddTagModal} data={data} />}
    </div>
  );
}
