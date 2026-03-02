"use client";
// next
import { useState } from "react";
// others
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
// images
import { AiOutlineEdit } from "react-icons/ai";
import { ImSpinner2 } from "react-icons/im";
// components
import PasswordModal from "./_components/modals/PasswordModal";
import EmailModal from "./_components/modals/EmailModal";
import AddCategoryModal from "./_components/modals/AddCategoryModal";
import AddTagModal from "./_components/modals/AddTagModal";
import CategoryContainer from "./_components/CategoryContainer";
import TagsContainer from "./_components/TagsContainer";
import SettingsField from "./_components/SettingsField";
import SettingsCard from "./_components/SettingsCard";
import SettingsSkeleton from "./_components/SettingsSkeleton";
import SettingsCategoryContainer from "./_components/SettingsCategoryContainer";
// utils
import { capitalizeFirst } from "@/utils/functions";
import { useUserQuery, useSettingsMutation } from "@/utils/hooks";
import Toggle from "@/utils/components/Toggle";
import { CategoryObject } from "@/db/UserModel";

export default function Settings({ provider, email }: { provider: string; email: string }) {
  // hooks
  const { resolvedTheme, setTheme } = useTheme();
  const { data, isPending, isError } = useUserQuery(email);
  const { mutateAsync: settingsMutateAsync, isPending: isSaving } = useSettingsMutation();

  // states
  const [passwordModal, setPasswordModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [addTagModal, setAddTagModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const [clickedTag, setClickedTag] = useState("");

  return (
    <>
      <SettingsCard title="Settings">
        <SettingsField label="Email">
          <div className="flex items-center gap-2 overflow-hidden">
            <p className="grow font-medium truncate">{email}</p>
            {provider === "credentials" && <AiOutlineEdit className="settingsEditIcon" onClick={() => setEmailModal(true)} />}
          </div>
        </SettingsField>
        {provider === "credentials" ? (
          <SettingsField label="Password">
            <div className="flex items-center gap-2">
              {"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
              <AiOutlineEdit className="settingsEditIcon" onClick={() => setPasswordModal(true)} />
            </div>
          </SettingsField>
        ) : (
          <SettingsField label="Login Method">
            <div className="font-medium">{capitalizeFirst(provider)}</div>
          </SettingsField>
        )}
        <SettingsField label="Default Currency" className="border-none">
          {data ? (
            <select
              className="bg-transparent border-none outline-none cursor-pointer font-medium"
              value={data.settings.defaultCurrency}
              onChange={(e) => {
                settingsMutateAsync({ type: "changeCurrency", currency: e.currentTarget.value });
              }}
            >
              <option value="USD">USD</option>
              <option value="TWD">TWD</option>
              <option value="EUR">EUR</option>
              <option value="JPY">JPY</option>
            </select>
          ) : (
            <SettingsSkeleton className="settingsSkeletonSmall" />
          )}
        </SettingsField>
      </SettingsCard>

      <SettingsCard title="Categories & Tags">
        <SettingsCategoryContainer
          label="Categories"
          onClickAdd={() => {
            setClickedCategory(null);
            setAddCategoryModal(true);
          }}
        >
          {data ? (
            data.settings.categoryObjects.length > 1 ? (
              <CategoryContainer
                categoryObjects={data.settings.categoryObjects}
                setAddCategoryModal={setAddCategoryModal}
                setClickedCategory={setClickedCategory}
              />
            ) : (
              <div className="text-center text-slate-500 italic">No categories</div>
            )
          ) : (
            <SettingsSkeleton className="settingsSkeletonBig" />
          )}
        </SettingsCategoryContainer>
        <SettingsCategoryContainer
          label="Tags"
          onClickAdd={() => {
            setClickedTag("");
            setAddTagModal(true);
          }}
        >
          {data ? (
            data.settings.tags.length > 1 ? (
              <TagsContainer
                tags={data?.settings.tags}
                key={JSON.stringify(data?.settings.tags)}
                setAddTagModal={setAddTagModal}
                setClickedTag={setClickedTag}
              />
            ) : (
              <div className="text-center text-slate-500 italic">No tags</div>
            )
          ) : (
            <SettingsSkeleton className="settingsSkeletonBig" />
          )}
        </SettingsCategoryContainer>
      </SettingsCard>

      {/*--- DISPLAY  ---*/}
      <SettingsCard title="Display">
        <SettingsField label="Dark" className="border-none">
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
        </SettingsField>
      </SettingsCard>

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

      {passwordModal && <PasswordModal setPasswordModal={setPasswordModal} email={email} />}
      {emailModal && <EmailModal setEmailModal={setEmailModal} />}
      {addCategoryModal && (
        <AddCategoryModal
          data={data}
          setAddCategoryModal={setAddCategoryModal}
          clickedCategory={clickedCategory}
          setClickedCategory={setClickedCategory}
        />
      )}
      {addTagModal && <AddTagModal data={data} setAddTagModal={setAddTagModal} clickedTag={clickedTag} />}
    </>
  );
}
