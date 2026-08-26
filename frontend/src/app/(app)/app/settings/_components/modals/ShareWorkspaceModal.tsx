import { useState } from "react";
import { useSession } from "next-auth/react";
// components
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/modal/Modal";
import { FaX } from "react-icons/fa6";
// utils
import { useUserMutation, useSharedUsersQuery } from "@/utils/hooks";
import Spinner from "@/utils/components/Spinner";
import { checkEmail } from "@/utils/functions";
import { Role, PendingSharedUser } from "@/utils/types";
import Input from "@/utils/components/Input";
import Select from "@/utils/components/Select";
import ErrorMessage from "@/utils/components/ErrorMessage";

export default function ShareWorkspaceModal({
  workspaceId,
  workspaceName,
  setShareWorkspaceModal,
}: {
  workspaceId: string;
  workspaceName: string;
  setShareWorkspaceModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // hooks
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const { data: sharedData, isLoading: isLoadingShared, isError: isSharedError } = useSharedUsersQuery(workspaceId);
  const sharedUsers = sharedData?.sharedUsers ?? [];
  const pendingSharedUsers = sharedData?.pendingSharedUsers ?? [];
  // states
  const { mutateAsync: userMutateAsync, error, isError, isPending } = useUserMutation();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("viewer");
  const [validationError, setValidationError] = useState("");
  const [status, setStatus] = useState("initial"); // "initial", "sharing", "deletingSharedUser{id}", "deletingPendingSharedUser{id}"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId || isPending) return;
    // exists
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      setValidationError("Please enter an email.");
      return;
    }
    // validate email
    if (!checkEmail(email)) {
      setValidationError("Invalid email.");
      return;
    }
    // cannot invite self
    if (email === userEmail) {
      setValidationError("Cannot invite yourself.");
      return;
    }
    // mutation
    setStatus("sharing");
    setValidationError("");
    try {
      await userMutateAsync({
        type: "shareWorkspace",
        workspaceId,
        workspaceName,
        email,
        role: inviteRole as "editor" | "viewer",
      });
    } catch {} // error will show on UI
    // reset (whether success or error)
    setInviteEmail("");
    setInviteRole("viewer");
    setStatus("initial");
  }

  async function updateRole(sharedUserId: string, role: "editor" | "viewer") {
    if (!workspaceId || isPending) return;
    setValidationError("");
    try {
      await userMutateAsync({ type: "updateSharedUser", workspaceId, sharedUserId, role });
    } catch {} // error will show on UI
  }

  async function deleteSharedUser(sharedUserId: string) {
    if (!workspaceId || isPending) return;
    setValidationError("");
    setStatus(`deletingSharedUser${sharedUserId}`);
    try {
      await userMutateAsync({ type: "deleteSharedUser", workspaceId, sharedUserId });
    } catch {} // error will show on UI
    setStatus("");
  }

  async function deletePendingSharedUser(user: PendingSharedUser) {
    if (!workspaceId || isPending) return;
    setValidationError("");
    setStatus(`deletingPendingSharedUser${user._id}`);
    try {
      await userMutateAsync({ type: "deletePendingSharedUser", workspaceId, invitedEmail: user.invitedEmail });
    } catch {} // error will show on UI
    setStatus("");
  }

  return (
    <Modal title="Share Workspace" onClose={() => setShareWorkspaceModal(false)} disabled={isPending}>
      <div className="w-full flex flex-col">
        {/*--- INVITE FORM ---*/}
        <form className="w-full" onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-[1fr_auto] gap-x-3">
            <label className="inputLabel">Email</label>
            <label className="inputLabel">Role</label>
            <Input
              className="w-full"
              inputSize="base"
              variant="primary"
              type="email"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.currentTarget.value);
                setValidationError("");
              }}
              disabled={isPending}
            />
            <Select
              className="w-full"
              selectSize="base"
              variant="primary"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.currentTarget.value as Role)}
              disabled={isPending}
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </Select>
          </div>
          {/*--- Share button ---*/}
          <Button
            className="mt-4 w-full"
            label="Share Workspace"
            variant="primary"
            size="base"
            isLoading={status === "sharing"}
            disabled={isPending || status !== "initial"}
            type="submit"
          />
          {/*--- error message ---*/}
          <ErrorMessage message={validationError ? validationError : isError ? error?.message : ""} />
        </form>

        {/*--- SHARED WITH ---*/}
        <div className="py-6 border-t-[1.5px] border-borderFaint">
          <p className="font-medium">Shared With</p>
          <div className="mt-4 flex flex-col gap-4 textSm tablet:textBase">
            {isLoadingShared ? (
              <div className="w-full flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : isSharedError ? (
              <div className="text-center text-textDanger py-4">Failed to load shared users.</div>
            ) : sharedUsers.length === 0 && pendingSharedUsers.length === 0 ? (
              <div className="text-center opacity-70 py-4">No shared users yet.</div>
            ) : (
              <>
                {pendingSharedUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1 truncate">{user.invitedEmail}</div>
                    <Button
                      label="Pending"
                      variant="outline"
                      size="pill"
                      iconRight={<FaX className="text-sm desktop:text-xs translate-y-[1px] text-textDanger" />}
                      onClick={() => deletePendingSharedUser(user)}
                      isLoading={status === `deletingPendingSharedUser${user._id}`}
                      disabled={isPending}
                    />
                  </div>
                ))}
                {sharedUsers.map((user) => (
                  <div key={user._id} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1 truncate">{user.email}</div>
                    <Select
                      selectSize="base"
                      variant="primary"
                      value={user.role}
                      onChange={(e) => {
                        if (e.currentTarget.value === "remove") {
                          deleteSharedUser(user._id);
                          return;
                        }
                        updateRole(user._id, e.currentTarget.value as "editor" | "viewer");
                      }}
                      disabled={isPending}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                      <option disabled>────</option>
                      <option value="remove">Remove</option>
                    </Select>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
