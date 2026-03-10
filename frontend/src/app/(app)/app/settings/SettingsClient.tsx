"use client";
// next
import { useState } from "react";
// others
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
// images
import { AiOutlineEdit } from "react-icons/ai";
import { ImSpinner2 } from "react-icons/im";
import { FiShare2, FiTrash2 } from "react-icons/fi";
import { FaChevronDown } from "react-icons/fa6";
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
import ShareWorkspaceModal from "./_components/modals/ShareWorkspaceModal";
import LeaveWorkspaceModal from "./_components/modals/LeaveWorkspaceModal";
import ConfirmActionModal from "./_components/modals/ConfirmActionModal";
import AddWorkspaceModal from "./_components/modals/AddWorkspaceModal";
import Select from "@/utils/components/Select";
import ButtonSettings from "@/utils/components/ButtonSettings";
import ErrorModal from "@/utils/components/ErrorModal";
// utils
import { capitalizeFirst } from "@/utils/functions";
import { useSettingsMutation, useSettingsQuery, useUserMutation } from "@/utils/hooks";
import Toggle from "@/utils/components/Toggle";
import { CURRENCIES } from "@/utils/constants";

export default function Settings({ provider, email, userId }: { provider: string; email: string; userId: string }) {
  // hooks
  const { resolvedTheme, setTheme } = useTheme();
  const { data, isPending: isGettingSettings, isError } = useSettingsQuery(email);
  const { mutateAsync: settingsMutateAsync, isPending: isMutatingSettings } = useSettingsMutation();
  const { mutateAsync: userMutateAsync, isPending: isMutatingUser } = useUserMutation();

  // states
  const [errorMessage, setErrorMessage] = useState("");
  const [errorModal, setErrorModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [addTagModal, setAddTagModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const [clickedTag, setClickedTag] = useState("");
  // workspace modals
  const [addWorkspaceModal, setAddWorkspaceModal] = useState(false);
  const [shareWorkspaceModal, setShareWorkspaceModal] = useState(false);
  const [deleteWorkspaceModal, setDeleteWorkspaceModal] = useState(false);
  const [leaveWorkspaceModal, setLeaveWorkspaceModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

  return (
    <>
      {/*--- BUDGET SHEET SETTINGS ---*/}
      <SettingsCard title="Budget Sheet Settings">
        {/*--- Select Active Sheet ---*/}
        <div className="flex-none w-full py-3 desktop:py-3 flex flex-col desktop:flex-row desktop:items-center desktop:justify-between gap-2 desktop:gap-12 border-b-[1.5px] border-borderFaint">
          <div>Current Sheet</div>
          {data ? (
            <Select
              fullWidth={true}
              value={data?.workspace._id}
              onChange={(e) => {
                if (e.currentTarget.value === "new") {
                  setAddWorkspaceModal(true);
                } else {
                  userMutateAsync({ type: "setActiveWorkspace", workspaceId: e.currentTarget.value });
                }
              }}
              disabled={isMutatingUser}
            >
              {data.workspaceOptions.map((i) => (
                <option key={i._id} value={i._id}>
                  {`${i.name} (${i.role})`} {i.role !== "owner" && `· ${i.ownerEmail}`}
                </option>
              ))}
              <option value="new">New Sheet</option>
            </Select>
          ) : (
            <SettingsSkeleton className="settingsSkeletonSmall" />
          )}
        </div>
        {/*--- Default Currency ---*/}
        <SettingsField label="Default Currency">
          {data ? (
            <Select
              value={data?.workspace.defaultCurrency}
              onChange={(e) => {
                settingsMutateAsync({ type: "changeCurrency", workspaceId: data.workspace._id, currency: e.currentTarget.value });
              }}
              disabled={isMutatingSettings}
            >
              {CURRENCIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
          ) : (
            <SettingsSkeleton className="settingsSkeletonSmall" />
          )}
        </SettingsField>

        {/*--- Categories ---*/}
        <SettingsCategoryContainer
          label="Categories"
          addButtonLabel="Category"
          onClickAdd={() => {
            setClickedCategory(null);
            setAddCategoryModal(true);
          }}
        >
          {data && !isMutatingUser ? (
            data.workspace.categoryObjects.length > 1 ? (
              <CategoryContainer
                categoryObjects={data.workspace.categoryObjects}
                setAddCategoryModal={setAddCategoryModal}
                setClickedCategory={setClickedCategory}
                workspaceId={data.workspace._id}
              />
            ) : (
              <div className="text-center text-slate-500 italic">No categories</div>
            )
          ) : (
            <SettingsSkeleton className="settingsSkeletonBig" />
          )}
        </SettingsCategoryContainer>
        {/*--- Tags ---*/}
        <SettingsCategoryContainer
          label="Tags"
          addButtonLabel="Tag"
          onClickAdd={() => {
            setClickedTag("");
            setAddTagModal(true);
          }}
        >
          {data ? (
            data.workspace.tags.length > 1 ? (
              <TagsContainer
                workspaceId={data.workspace._id}
                tags={data?.workspace.tags}
                key={JSON.stringify(data?.workspace.tags)}
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
        {/*--- Share Sheet ---*/}
        {!data ? (
          <SettingsField label="Share Your Sheet">
            <SettingsSkeleton className="settingsSkeletonSmall" />
          </SettingsField>
        ) : data.role === "owner" ? (
          <SettingsField label="Share Your Sheet">
            <ButtonSettings label="Share" icon={<FiShare2 />} color="secondary" onClick={() => setShareWorkspaceModal(true)} />
          </SettingsField>
        ) : null}
        {/*--- Delete Sheet ---*/}
        {data?.role === "owner" ? (
          <SettingsField label="Delete Sheet" className="border-none">
            <ButtonSettings
              label="Delete"
              icon={<FiTrash2 />}
              color="danger"
              onClick={() => {
                if (data?.workspaceOptions.filter((w) => w.role === "owner").length) {
                  setErrorMessage("Sheet cannot be deleted as you must own at least one sheet.");
                  setErrorModal(true);
                } else {
                  setDeleteWorkspaceModal(true);
                }
              }}
            />
          </SettingsField>
        ) : (
          <SettingsField label="Leave Shared Sheet">
            <button className="link font-medium" onClick={() => setLeaveWorkspaceModal(true)}>
              Leave
            </button>
          </SettingsField>
        )}
      </SettingsCard>

      {/*--- ACCOUNT ---*/}
      <SettingsCard title="Account">
        {/*--- Email ---*/}
        <SettingsField label="Email">
          <div className="h-12 desktop:h-9 flex items-center gap-2 overflow-hidden">
            <p className="grow font-medium truncate">{email}</p>
            {provider === "credentials" && <AiOutlineEdit className="settingsEditIcon" onClick={() => setEmailModal(true)} />}
          </div>
        </SettingsField>
        {/*--- Login Method or Password ---*/}
        {provider === "credentials" ? (
          <SettingsField label="Password">
            <div className="h-12 desktop:h-9 flex items-center gap-2">
              {"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
              <AiOutlineEdit className="settingsEditIcon" onClick={() => setPasswordModal(true)} />
            </div>
          </SettingsField>
        ) : (
          <SettingsField label="Login Method">
            <div className="h-12 desktop:h-9 font-medium flex items-center">{capitalizeFirst(provider)}</div>
          </SettingsField>
        )}
        {/*--- Delete Account Button ---*/}
        <SettingsField label="Delete Account">
          <ButtonSettings label="Delete" icon={<FiTrash2 />} color="danger" onClick={() => setDeleteAccountModal(true)} />
        </SettingsField>
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

      {/*--- Sign Out ---*/}
      <button
        className="buttonSignOut"
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
      {addCategoryModal && data?.workspace && (
        <AddCategoryModal
          workspace={data.workspace}
          setAddCategoryModal={setAddCategoryModal}
          clickedCategory={clickedCategory}
          setClickedCategory={setClickedCategory}
        />
      )}
      {addTagModal && data?.workspace && <AddTagModal workspace={data.workspace} setAddTagModal={setAddTagModal} clickedTag={clickedTag} />}
      {addWorkspaceModal && data?.workspace && (
        <AddWorkspaceModal workspaceId={data.workspace._id} setAddWorkspaceModal={setAddWorkspaceModal} />
      )}
      {shareWorkspaceModal && data?.workspace && (
        <ShareWorkspaceModal
          sharedUsers={data.sharedUsers}
          pendingSharedUsers={data.pendingSharedUsers}
          workspaceId={data.workspace._id}
          workspaceName={data.workspace.name}
          setShareWorkspaceModal={setShareWorkspaceModal}
        />
      )}

      {leaveWorkspaceModal && data?.workspace && (
        <LeaveWorkspaceModal workspaceId={data.workspace._id} setLeaveWorkspaceModal={setLeaveWorkspaceModal} />
      )}
      {deleteWorkspaceModal && data?.workspace && (
        <ConfirmActionModal
          title="Delete Workspace"
          setModal={setDeleteWorkspaceModal}
          textToMatch={data.workspace.name}
          userMutateAsyncPayload={{ type: "deleteWorkspace", workspaceId: data.workspace._id }}
        />
      )}
      {deleteAccountModal && (
        <ConfirmActionModal
          title="Delete Account"
          setModal={setDeleteAccountModal}
          textToMatch={email}
          userMutateAsyncPayload={{ type: "deleteAccount", userId }}
          onSuccess={() => signOut({ callbackUrl: "/accountDeleted" })}
        />
      )}
      {errorModal && <ErrorModal errorMessage={errorMessage} setErrorMessage={setErrorMessage} setErrorModal={setErrorModal} />}
    </>
  );
}
