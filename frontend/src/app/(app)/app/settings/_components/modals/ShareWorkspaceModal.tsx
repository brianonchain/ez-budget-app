import { useState } from "react";
import { useSession } from "next-auth/react";
// components
import DeleteRowButton from "@/utils/components/DeleteRowButton";
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/Modal";
// utils
import { useUserMutation } from "@/utils/hooks";
import { checkEmail } from "@/utils/functions";
import { Role, SharedUser, PendingSharedUser } from "@/utils/types";

export default function ShareWorkspaceModal({
  workspaceId,
  workspaceName,
  setShareWorkspaceModal,
  sharedUsers,
  pendingSharedUsers,
}: {
  workspaceId: string;
  workspaceName: string;
  setShareWorkspaceModal: React.Dispatch<React.SetStateAction<boolean>>;
  sharedUsers: SharedUser[];
  pendingSharedUsers: PendingSharedUser[];
}) {
  // hooks
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  // states
  const { mutateAsync: userMutateAsync, error, isError, isPending } = useUserMutation();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("viewer");
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState("initial");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId || isPending) return;
    // exists
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      setErrorMessage("Please enter an email.");
      return;
    }
    // validate email
    if (!checkEmail(email)) {
      setErrorMessage("Invalid email.");
      return;
    }
    // cannot invite self
    if (email === userEmail) {
      setErrorMessage("Cannot invite yourself.");
      return;
    }
    // mutation
    setStatus("sharing");
    setErrorMessage("");
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

  async function updateRole(sharedUserId: string, role: Role) {
    if (!workspaceId || isPending) return;
    setErrorMessage("");
    try {
      await userMutateAsync({ type: "updateSharedUser", workspaceId, sharedUserId, role: role as "editor" | "viewer" });
    } catch {} // error will show on UI
  }

  async function deleteSharedUser(sharedUserId: string) {
    if (!workspaceId || isPending) return;
    setErrorMessage("");
    setStatus(`deletingSharedUser${sharedUserId}`);
    try {
      await userMutateAsync({ type: "deleteSharedUser", workspaceId, sharedUserId });
    } catch {} // error will show on UI
    setStatus("");
  }

  async function deletePendingSharedUser(user: PendingSharedUser) {
    if (!workspaceId || isPending) return;
    setErrorMessage("");
    setStatus(`deletingPendingSharedUser${user._id}`);
    try {
      console.log(user);
      await userMutateAsync({ type: "deletePendingSharedUser", workspaceId, invitedEmail: user.invitedEmail });
    } catch {} // error will show on UI
    setStatus("");
  }

  return (
    <Modal title="Share Workspace" setModal={setShareWorkspaceModal} disableCloseButton={isPending}>
      <div className="mx-auto w-full max-w-[400px] flex flex-col">
        {/*--- invite form ---*/}
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block pb-1.5 inputLabel">Email</label>
              <input
                className="input w-full"
                type="email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.currentTarget.value);
                  setErrorMessage("");
                }}
                disabled={isPending}
              />
            </div>

            <div className="">
              <label className="block pb-1.5 inputLabel">Role</label>
              <select
                className="input w-full"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.currentTarget.value as Role)}
                disabled={isPending}
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>
          {/*--- Share Workspace button ---*/}
          <div>
            <Button
              label="Share Workspace"
              isLoading={status === "sharing"}
              disabled={isPending || status !== "initial" || !inviteEmail.trim()}
              type="submit"
            />
            <div className="py-2 w-full errorText min-h-[3.7em] leading-tight">{errorMessage || (isError ? error?.message : "")}</div>
          </div>
        </form>

        {/*--- shared users list ---*/}
        <div className="py-6 border-t-[1.5px] border-borderFaint">
          <p className="inputLabel">Shared With</p>

          <div className="mt-4 flex flex-col gap-2">
            {sharedUsers.length === 0 && pendingSharedUsers.length === 0 ? (
              <div className="text-center opacity-70 py-4">No shared users yet.</div>
            ) : (
              <>
                {pendingSharedUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1 truncate">{user.invitedEmail}</div>
                    <div className="italic text-text2">pending</div>
                    <DeleteRowButton
                      onClick={() => deletePendingSharedUser(user)}
                      isLoading={status === `deletingSharedUser${user._id}`}
                      disabled={isPending}
                    >
                      Delete
                    </DeleteRowButton>
                  </div>
                ))}
                {sharedUsers.map((user) => (
                  <div key={user._id} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1 truncate">{user.email}</div>

                    <select
                      className="input !h-9 !w-28 shrink-0"
                      value={user.role}
                      onChange={(e) => updateRole(user._id, e.currentTarget.value as Role)}
                      disabled={isPending}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    <DeleteRowButton
                      onClick={() => deleteSharedUser(user._id)}
                      isLoading={status === `deletingSharedUser${user._id}`}
                      disabled={isPending}
                    >
                      Delete
                    </DeleteRowButton>
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
