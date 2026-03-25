import { useState } from "react";
import { useSession } from "next-auth/react";
// components
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/Modal";
import { FaX } from "react-icons/fa6";
// utils
import { useUserMutation } from "@/utils/hooks";
import { checkEmail } from "@/utils/functions";
import { Role, SharedUser, PendingSharedUser } from "@/utils/types";
import Input from "@/utils/components/Input";
import Select from "@/utils/components/Select";

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
  const [status, setStatus] = useState("initial"); // "initial", "sharing", "deletingSharedUser{id}", "deletingPendingSharedUser{id}"

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

  async function updateRole(sharedUserId: string, role: "editor" | "viewer") {
    if (!workspaceId || isPending) return;
    setErrorMessage("");
    try {
      await userMutateAsync({ type: "updateSharedUser", workspaceId, sharedUserId, role });
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
      await userMutateAsync({ type: "deletePendingSharedUser", workspaceId, invitedEmail: user.invitedEmail });
    } catch {} // error will show on UI
    setStatus("");
  }

  return (
    <Modal title="Share Workspace" setModal={setShareWorkspaceModal} disableCloseButton={isPending}>
      <div className="mx-auto w-full max-w-100 flex flex-col">
        {/*--- invite form ---*/}
        <form className="w-full flex flex-col" onSubmit={onSubmit} noValidate>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block pb-1.5 labelBase">Email</label>
              <Input
                className="w-full"
                inputSize="base"
                variant="primary"
                type="email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.currentTarget.value);
                  setErrorMessage("");
                }}
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block pb-1.5 labelBase">Role</label>
              <Select
                className="w-full"
                selectSize="base"
                variant="outline"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.currentTarget.value as Role)}
                disabled={isPending}
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </Select>
            </div>
          </div>
          {/*--- Share Workspace button ---*/}
          <Button
            className="mt-4 w-full"
            label="Share Workspace"
            variant="primary"
            size="base"
            isLoading={status === "sharing"}
            disabled={isPending || status !== "initial" || !inviteEmail.trim()}
            type="submit"
          />
          {/*--- error message ---*/}
          <div className="min-h-19 desktop:min-h-15 modalErrorMessage">{errorMessage || (isError ? error?.message : "")}</div>
        </form>

        {/*--- shared users list ---*/}
        <div className="py-6 border-t-[1.5px] border-borderFaint">
          <p className="labelBase">Shared With</p>
          <div className="mt-4 flex flex-col gap-4 textXs">
            {sharedUsers.length === 0 && pendingSharedUsers.length === 0 ? (
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
                      iconRight={<FaX className="text-sm desktop:text-xs translate-y-[1px] text-textError" />}
                      onClick={() => deletePendingSharedUser(user)}
                      isLoading={status === `deletingSharedUser${user._id}`}
                      disabled={isPending}
                    />
                  </div>
                ))}
                {sharedUsers.map((user) => (
                  <div key={user._id} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1 truncate">{user.email}</div>
                    <Select
                      selectSize="xs"
                      variant="outline"
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
