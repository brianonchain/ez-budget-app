import { useSettingsMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
export default function LeaveWorkspaceModal({
  workspaceId,
  setLeaveWorkspaceModal,
}: {
  workspaceId: string;
  setLeaveWorkspaceModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { mutateAsync: settingsMutateAsync, error, isError, isPending } = useSettingsMutation();

  return (
    <Modal title="Confirm Leaving Workspace" setModal={setLeaveWorkspaceModal} disableCloseButton={isPending}>
      ShareWorkspaceModal
    </Modal>
  );
}
