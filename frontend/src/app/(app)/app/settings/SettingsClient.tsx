"use client";
// next
import { useState, useEffect } from "react";
// others
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
// images
import { FiShare2, FiTrash2, FiLogOut, FiUserMinus, FiEdit } from "react-icons/fi";
import { FaUserMinus, FaTrashCan, FaArrowRightFromBracket, FaShareNodes } from "react-icons/fa6";
// components (modals)
import PasswordModal from "./_components/modals/PasswordModal";
import EmailModal from "./_components/modals/EmailModal";
import AddCategoryModal from "./_components/modals/AddCategoryModal";
import AddTagModal from "./_components/modals/AddTagModal";
import ShareWorkspaceModal from "./_components/modals/ShareWorkspaceModal";
import ConfirmActionModal from "./_components/modals/ConfirmActionModal";
import AddWorkspaceModal from "./_components/modals/AddWorkspaceModal";
import ErrorModal from "@/utils/components/ErrorModal";
// components
import CategoryContainer from "./_components/CategoryContainer";
import TagsContainer from "./_components/TagsContainer";
import SettingsField from "./_components/SettingsField";
import SettingsCard from "./_components/SettingsCard";
import SettingsSkeleton from "./_components/SettingsSkeleton";
import SettingsCategoryContainer from "./_components/SettingsCategoryContainer";
import Button from "@/utils/components/Button";
import Select from "@/utils/components/Select";
// utils
import { capitalizeFirst } from "@/utils/functions";
import { useSettingsMutation, useSettingsQuery, useUserMutation } from "@/utils/hooks";
import Toggle from "@/utils/components/Toggle";
import { CURRENCIES } from "@/utils/constants";

export default function Settings({ provider, email, userId }: { provider: string; email: string; userId: string }) {
  // hooks
  const { resolvedTheme, setTheme } = useTheme();
  const { data, isError, isFetching: isFetchingSettings } = useSettingsQuery(email);
  const { mutateAsync: settingsMutateAsync, isPending: isMutatingSettings } = useSettingsMutation();
  const { mutateAsync: userMutateAsync, isPending: isMutatingUser } = useUserMutation();

  // draft states
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const [clickedTag, setClickedTag] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  // modal states (TODO: aggregate)
  const [passwordModal, setPasswordModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [addTagModal, setAddTagModal] = useState(false);
  const [addWorkspaceModal, setAddWorkspaceModal] = useState(false);
  const [shareWorkspaceModal, setShareWorkspaceModal] = useState(false);
  const [deleteWorkspaceModal, setDeleteWorkspaceModal] = useState(false);
  const [leaveWorkspaceModal, setLeaveWorkspaceModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

  const showData = !!data && data.workspace._id === workspaceId;

  // update UI state for defaultCurrency
  useEffect(() => {
    if (data?.workspace.defaultCurrency) setDefaultCurrency(data.workspace.defaultCurrency);
  }, [data?.workspace.defaultCurrency]);

  // update UI state for workspaceName
  useEffect(() => {
    if (data?.workspace._id) setWorkspaceId(data.workspace._id);
  }, [data?.workspace._id]);

  async function onChangeActiveSheet(e: React.ChangeEvent<HTMLSelectElement>) {
    // add new workspace
    if (e.currentTarget.value === "new") {
      setAddWorkspaceModal(true);
      return;
    }
    // update active workspace
    const oldWorkspaceId = workspaceId;
    setWorkspaceId(e.currentTarget.value);
    try {
      await userMutateAsync({ type: "setActiveWorkspace", workspaceId: e.currentTarget.value });
    } catch {
      setWorkspaceId(oldWorkspaceId);
    }
  }

  async function onChangeDefaultCurrency(e: React.ChangeEvent<HTMLSelectElement>, workspaceId: string) {
    const oldCurrency = defaultCurrency;
    setDefaultCurrency(e.currentTarget.value);
    try {
      await settingsMutateAsync({ type: "changeCurrency", workspaceId, currency: e.currentTarget.value });
    } catch {
      setDefaultCurrency(oldCurrency);
    }
  }

  function onClickDeleteSheet() {
    const ownerCount = data?.workspaceOptions.filter((w) => w.role === "owner").length ?? 0;
    if (ownerCount <= 1) {
      setErrorMessage("Sheet cannot be deleted as you must own at least one sheet.");
      return;
    }
    setDeleteWorkspaceModal(true);
  }
  return (
    <>
      {/*--- BUDGET SHEET SETTINGS ---*/}
      <SettingsCard title="Active Sheet Settings">
        {/*--- Select Active Sheet ---*/}
        <div className="flex-none w-full py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="settingsLabel">Active Sheet</div>
          {data ? (
            <Select
              variant="transparent"
              selectSize="sm"
              fullWidth={true}
              value={workspaceId}
              onChange={onChangeActiveSheet}
              disabled={isMutatingUser}
            >
              {data.workspaceOptions.map((i) => (
                <option key={i._id} value={i._id}>
                  {`${i.name} (${i.role})`} {i.role !== "owner" && `· ${i.ownerEmail}`}
                </option>
              ))}
              <option value="new">+ Create New Sheet</option>
            </Select>
          ) : (
            <SettingsSkeleton size="lg" className="sm:flex-1" />
          )}
        </div>

        {/*--- Categories & Tags ---*/}
        <div className="my-3 px-6 pt-4 pb-6 flex flex-col gap-6 rounded-3xl border border-inputOutlineBorder">
          <SettingsCategoryContainer
            label="Categories"
            addButtonLabel="Category"
            onClickAdd={() => {
              setClickedCategory(null);
              setAddCategoryModal(true);
            }}
          >
            {showData ? (
              data.workspace.categoryObjects.length > 1 ? (
                <CategoryContainer
                  categoryObjects={data.workspace.categoryObjects}
                  setAddCategoryModal={setAddCategoryModal}
                  setClickedCategory={setClickedCategory}
                  workspaceId={data.workspace._id}
                />
              ) : (
                <div className="text-center text-textSecondary italic">No categories</div>
              )
            ) : (
              <SettingsSkeleton size="lg" />
            )}
          </SettingsCategoryContainer>
          <SettingsCategoryContainer
            label="Tags"
            addButtonLabel="Tag"
            onClickAdd={() => {
              setClickedTag("");
              setAddTagModal(true);
            }}
          >
            {showData ? (
              data.workspace.tags.length > 1 ? (
                <TagsContainer
                  workspaceId={data.workspace._id}
                  tags={data?.workspace.tags}
                  key={JSON.stringify(data?.workspace.tags)}
                  setAddTagModal={setAddTagModal}
                  setClickedTag={setClickedTag}
                />
              ) : (
                <div className="text-center text-textSecondary italic">No tags</div>
              )
            ) : (
              <SettingsSkeleton size="lg" />
            )}
          </SettingsCategoryContainer>
        </div>
        {/*--- Default Currency ---*/}
        {showData ? (
          data.role === "owner" ? (
            <SettingsField label="Default Currency">
              <Select
                variant="transparent"
                selectSize="sm"
                value={defaultCurrency}
                onChange={(e) => onChangeDefaultCurrency(e, data.workspace._id)}
                disabled={isMutatingSettings}
              >
                {CURRENCIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </Select>
            </SettingsField>
          ) : null
        ) : (
          <SettingsField label="Default Currency" className="border-none">
            <SettingsSkeleton size="sm" />
          </SettingsField>
        )}
        {/*--- Share Sheet ---*/}
        {showData ? (
          data.role === "owner" ? (
            <SettingsField label="Share This Sheet">
              <Button
                label="Share"
                variant="transparent"
                size="sm"
                type="button"
                icon={<FiShare2 />}
                onClick={() => setShareWorkspaceModal(true)}
              />
            </SettingsField>
          ) : null
        ) : (
          <SettingsField label="Share This Sheet">
            <SettingsSkeleton size="sm" />
          </SettingsField>
        )}
        {/*--- Delete or Leave Sheet ---*/}
        {showData ? (
          data.role === "owner" ? (
            <SettingsField label="Delete Sheet" className="border-none">
              <Button label="Delete" variant="dangerTrans" size="sm" type="button" icon={<FiTrash2 />} onClick={onClickDeleteSheet} />
            </SettingsField>
          ) : (
            <SettingsField label="Leave Shared Sheet" className="border-none">
              <Button
                label="Leave"
                variant="transparent"
                size="sm"
                type="button"
                icon={<FiUserMinus />}
                onClick={() => setLeaveWorkspaceModal(true)}
              />
            </SettingsField>
          )
        ) : (
          <SettingsField label="Delete Sheet">
            <SettingsSkeleton size="sm" />
          </SettingsField>
        )}
      </SettingsCard>

      {/*--- ACCOUNT ---*/}
      <SettingsCard title="Account">
        {/*--- Sign Out ---*/}
        <SettingsField label="Sign Out">
          <Button label="Sign Out" variant="transparent" size="sm" type="button" onClick={() => signOut({ callbackUrl: "/login" })} />
        </SettingsField>
        {/*--- Email ---*/}
        <SettingsField label="Email">
          <div className="h-12 desktop:h-9 flex items-center gap-2 overflow-hidden">
            <p className="grow font-medium truncate">{email}</p>
            {provider === "credentials" && (
              <Button
                className="h-12 desktop:h-9 flex items-center gap-2"
                variant="transparent"
                size="sm"
                type="button"
                icon={<FiEdit className="" />}
                onClick={() => setEmailModal(true)}
              />
            )}
          </div>
        </SettingsField>
        {/*--- Login Method or Password ---*/}
        {provider === "credentials" ? (
          <SettingsField label="Password">
            <div className="h-12 desktop:h-9 flex items-center gap-2">
              {"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
              <Button
                className="h-12 desktop:h-9 flex items-center gap-2"
                variant="transparent"
                size="sm"
                type="button"
                icon={<FiEdit className="" />}
                onClick={() => setPasswordModal(true)}
              />
            </div>
          </SettingsField>
        ) : (
          <SettingsField label="Login Method">
            <div className="h-12 desktop:h-9 font-medium flex items-center">{capitalizeFirst(provider)}</div>
          </SettingsField>
        )}
        {/*--- Delete Account Button ---*/}
        <SettingsField label="Delete Account" className="border-none">
          <Button
            label="Delete"
            variant="dangerTrans"
            size="sm"
            type="button"
            icon={<FiTrash2 />}
            onClick={() => setDeleteAccountModal(true)}
          />
        </SettingsField>
      </SettingsCard>

      {/*--- DISPLAY  ---*/}
      <SettingsCard title="Display">
        <SettingsField label="Dark" className="border-none">
          <Toggle checked={resolvedTheme === "dark"} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} />
        </SettingsField>
      </SettingsCard>

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
        <ConfirmActionModal
          title="Leave Workspace"
          setModal={setLeaveWorkspaceModal}
          textToMatch={data.workspace.name}
          userMutateAsyncPayload={{ type: "leaveWorkspace", workspaceId: data.workspace._id }}
        />
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
      {errorMessage && <ErrorModal errorMessage={errorMessage} setErrorMessage={setErrorMessage} />}
    </>
  );
}
