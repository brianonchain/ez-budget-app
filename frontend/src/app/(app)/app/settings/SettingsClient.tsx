"use client";
// next
import { useState, useEffect } from "react";
// others
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
// images
import { FiShare2, FiTrash2, FiUserMinus } from "react-icons/fi";
import { LuGripVertical } from "react-icons/lu";
// components (modals)
import PasswordModal from "./_components/modals/PasswordModal";
import ChangeEmailModal from "./_components/modals/ChangeEmailModal";
import AddCategoryModal from "./_components/modals/AddCategoryModal";
import AddTagModal from "./_components/modals/AddTagModal";
import ShareWorkspaceModal from "./_components/modals/ShareWorkspaceModal";
import ConfirmHighRiskModal from "@/utils/components/modal/ConfirmHighRiskModal";
import AddWorkspaceModal from "./_components/modals/AddWorkspaceModal";
import ExportModal from "./_components/modals/ExportModal";
import ErrorModal from "@/utils/components/simpleModal/ErrorModal";
import SignOutModal from "./_components/modals/SignOutModal";
// components
import CategoryContainer from "./_components/CategoryContainer";
import TagsContainer from "./_components/TagsContainer";
import SettingsField from "./_components/SettingsField";
import SettingsCard from "./_components/SettingsCard";
import SettingsSkeleton from "./_components/SettingsSkeleton";
import SettingsCategoryContainer from "./_components/SettingsCategoryContainer";
import Button from "@/utils/components/Button";
import Select from "@/utils/components/Select";
import Toggle from "@/utils/components/Toggle";
import EditIcon from "@/utils/components/EditIcon";
// utils
import { capitalizeFirst, fetchPost } from "@/utils/functions";
import { useWorkspaceMutation, useWorkspaceQuery, useUserMutation, useItemsQuery } from "@/utils/hooks";
import { CURRENCIES } from "@/utils/constants";

export default function Settings({ provider, email, userId }: { provider: string; email: string; userId: string }) {
  // hooks
  const queryClient = useQueryClient();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: itemsData } = useItemsQuery();
  const { data, isError, isFetching: isFetchingSettings } = useWorkspaceQuery(itemsData?.pages[0]?.activeWorkspaceId ?? null);
  const { mutateAsync: mutateWorkspaceAsync, isPending: isMutatingSettings } = useWorkspaceMutation();
  const { mutateAsync: userMutateAsync, isPending: isMutatingUser } = useUserMutation();

  // states
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const [clickedTag, setClickedTag] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsPending, setNotificationsPending] = useState(false);
  const [pushSupported, setPushSupported] = useState<boolean | null>(null);
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
  const [exportModal, setExportModal] = useState(false);
  const [signOutModal, setSignOutModal] = useState(false);

  const showData = !!data && data.workspace._id === workspaceId;

  // update UI state for defaultCurrency
  useEffect(() => {
    if (data?.workspace.defaultCurrency) setDefaultCurrency(data.workspace.defaultCurrency);
  }, [data?.workspace.defaultCurrency]);

  // update UI state for workspaceName
  useEffect(() => {
    if (data?.workspace._id) setWorkspaceId(data.workspace._id);
  }, [data?.workspace._id]);

  // push + permission support (client only)
  useEffect(() => {
    setPushSupported(typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window);
  }, []);

  // sync notifications toggle from browser (permission + active subscription)
  useEffect(() => {
    if (pushSupported !== true) return;
    let cancelled = false;
    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        const on = Notification.permission === "granted" && subscription !== null;
        if (!cancelled) setNotificationsEnabled(on);
      } catch {
        if (!cancelled) setNotificationsEnabled(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pushSupported]);

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
      await mutateWorkspaceAsync({ type: "changeCurrency", workspaceId, currency: e.currentTarget.value });
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

  async function onToggleNotifications() {
    if (pushSupported !== true || notificationsPending) return;

    // subscribe
    if (!notificationsEnabled) {
      setNotificationsPending(true);
      try {
        console.log("asking for permission");
        console.log("secure context:", window.isSecureContext);
        console.log("permission:", Notification.permission);
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setErrorMessage("Notifications are blocked or denied. Allow them in your browser settings and try again.");
          setNotificationsEnabled(false);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!subscription) {
          if (!vapidKey) throw new Error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY");
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          });
        }

        const subJson = subscription.toJSON();
        await fetchPost("/api/subscribe", {
          type: "subscribe",
          endpoint: subJson.endpoint,
          keys: subJson.keys,
          expirationTime: subJson.expirationTime ?? null,
        });
        setNotificationsEnabled(true);
      } catch (e) {
        console.error("Enable notifications failed:", e);
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();
          await sub?.unsubscribe();
        } catch {
          /* ignore */
        }
        setErrorMessage(e instanceof Error ? e.message : "Could not enable notifications. Please try again.");
        setNotificationsEnabled(false);
      } finally {
        setNotificationsPending(false);
      }
      return;
    }

    // unsubscribe
    setNotificationsPending(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await fetchPost("/api/subscribe", { type: "unsubscribe", endpoint });
      }
      setNotificationsEnabled(false);
    } catch (e) {
      console.error("Disable notifications failed:", e);
      setErrorMessage("Could not turn off notifications completely. Try again.");
    } finally {
      setNotificationsPending(false);
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  async function onSignOut() {
    setIsSigningOut(true);
    queryClient.clear(); // clears query cache, I believe
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("ezb:")) localStorage.removeItem(key);
    }
    signOut({ callbackUrl: "/login" });
  }

  return (
    <>
      {/*--- BUDGET SHEET SETTINGS ---*/}
      <SettingsCard title="Active Sheet Settings">
        {/*--- Select Active Sheet ---*/}
        <div className="flex-none w-full py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 border-b border-borderFaint">
          <div className="settingsLabel">Active Sheet</div>
          {data ? (
            <Select
              className="flex-1"
              variant="outline"
              selectSize="base"
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
        <SettingsCategoryContainer
          label="Categories & Subcategories"
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
        {/*--- Default Currency ---*/}
        {showData ? (
          data.role === "owner" ? (
            <SettingsField label="Default Currency">
              <Select
                className="font-medium" // use font-medium to match buttons
                variant="outline"
                selectSize="base"
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
          <SettingsField label="Default Currency">
            <SettingsSkeleton size="sm" />
          </SettingsField>
        )}
        {/*--- Notifications ---*/}
        <SettingsField label="Notifications">
          <Toggle
            checked={notificationsEnabled}
            disabled={pushSupported !== true || notificationsPending}
            onClick={onToggleNotifications}
            aria-label={notificationsEnabled ? "Turn off push notifications" : "Turn on push notifications"}
          />
        </SettingsField>
        {/*--- Export Sheet ---*/}
        <SettingsField label="Export Sheet">
          {showData ? (
            <Button label="Export" variant="outline" size="base" onClick={() => setExportModal(true)} />
          ) : (
            <SettingsSkeleton size="sm" />
          )}
        </SettingsField>
        {/*--- Share Sheet ---*/}
        {showData ? (
          data.role === "owner" ? (
            <SettingsField label="Share This Sheet">
              <Button label="Share" variant="outline" size="base" icon={<FiShare2 />} onClick={() => setShareWorkspaceModal(true)} />
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
              <Button label="Delete" variant="dangerOutline" size="base" icon={<FiTrash2 />} onClick={onClickDeleteSheet} />
            </SettingsField>
          ) : (
            <SettingsField label="Leave Shared Sheet" className="border-none">
              <Button label="Leave" variant="outline" size="base" icon={<FiUserMinus />} onClick={() => setLeaveWorkspaceModal(true)} />
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
          <Button className="w-26 desktop:w-21" label="Sign Out" variant="outline" size="base" onClick={() => setSignOutModal(true)} />
        </SettingsField>
        {/*--- Email ---*/}
        <SettingsField label="Email">
          <div className="h-12 desktop:h-9 flex items-center gap-2 overflow-hidden">
            <p className="grow font-medium truncate">{email}</p>
            {provider === "credentials" && <EditIcon onClick={() => setEmailModal(true)} ariaLabel="Change email" />}
          </div>
        </SettingsField>
        {/*--- Login Method or Password ---*/}
        {provider === "credentials" ? (
          <SettingsField label="Password">
            <div className="h-12 desktop:h-9 flex items-center gap-2">
              {"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
              <EditIcon onClick={() => setPasswordModal(true)} ariaLabel="Change password" />
            </div>
          </SettingsField>
        ) : (
          <SettingsField label="Login Method">
            <div className="h-12 desktop:h-9 font-medium flex items-center">{capitalizeFirst(provider)}</div>
          </SettingsField>
        )}
        {/*--- Delete Account Button ---*/}
        <SettingsField label="Delete Account" className="border-none">
          <Button label="Delete" variant="dangerOutline" size="base" icon={<FiTrash2 />} onClick={() => setDeleteAccountModal(true)} />
        </SettingsField>
      </SettingsCard>

      {/*--- DISPLAY  ---*/}
      <SettingsCard title="Display">
        <SettingsField label="Dark" className="border-none">
          {resolvedTheme ? (
            <Toggle
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              checked={resolvedTheme === "dark"}
              aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            />
          ) : (
            <SettingsSkeleton size="sm" />
          )}
        </SettingsField>
      </SettingsCard>

      <AnimatePresence>{passwordModal && <PasswordModal setPasswordModal={setPasswordModal} email={email} />}</AnimatePresence>
      <AnimatePresence>{emailModal && <ChangeEmailModal setEmailModal={setEmailModal} />}</AnimatePresence>
      <AnimatePresence>
        {addCategoryModal && data?.workspace && (
          <AddCategoryModal
            workspace={data.workspace}
            setAddCategoryModal={setAddCategoryModal}
            clickedCategory={clickedCategory}
            setClickedCategory={setClickedCategory}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {addTagModal && data?.workspace && (
          <AddTagModal workspace={data.workspace} setAddTagModal={setAddTagModal} clickedTag={clickedTag} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {addWorkspaceModal && data?.workspace && <AddWorkspaceModal setAddWorkspaceModal={setAddWorkspaceModal} />}
      </AnimatePresence>
      <AnimatePresence>
        {shareWorkspaceModal && data?.workspace && (
          <ShareWorkspaceModal
            workspaceId={data.workspace._id}
            workspaceName={data.workspace.name}
            setShareWorkspaceModal={setShareWorkspaceModal}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {leaveWorkspaceModal && data?.workspace && (
          <ConfirmHighRiskModal
            title="Leave Workspace"
            onClose={() => setLeaveWorkspaceModal(false)}
            textToMatch={data.workspace.name}
            userMutateAsyncPayload={{ type: "leaveWorkspace", workspaceId: data.workspace._id }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteWorkspaceModal && data?.workspace && (
          <ConfirmHighRiskModal
            title="Delete Workspace"
            onClose={() => setDeleteWorkspaceModal(false)}
            textToMatch={data.workspace.name}
            userMutateAsyncPayload={{ type: "deleteWorkspace", workspaceId: data.workspace._id }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteAccountModal && (
          <ConfirmHighRiskModal
            title="Delete Account"
            onClose={() => setDeleteAccountModal(false)}
            textToMatch={email}
            userMutateAsyncPayload={{ type: "deleteAccount", userId }}
            onSuccess={() => signOut({ callbackUrl: "/accountDeleted" })}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{exportModal && <ExportModal workspaceId={workspaceId} setExportModal={setExportModal} />}</AnimatePresence>
      <AnimatePresence>{errorMessage && <ErrorModal errorMessage={errorMessage} onClose={() => setErrorMessage("")} />}</AnimatePresence>
      <AnimatePresence>
        {signOutModal && <SignOutModal onClose={() => setSignOutModal(false)} onSignOut={onSignOut} isSigningOut={isSigningOut} />}
      </AnimatePresence>
    </>
  );
}
