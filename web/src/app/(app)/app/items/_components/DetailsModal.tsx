import Modal from "@/utils/components/modal/Modal";
import DetailsPage from "./DetailsPage";
import type { WorkspaceData, DraftItem } from "@/utils/types";

export default function AddItemModal({
  workspaceData,
  draftItem,
  setDraftItem,
  onClose,
}: {
  workspaceData: WorkspaceData;
  draftItem: DraftItem;
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
  onClose: () => void;
}) {
  return (
    <Modal title="Item Info" onClose={onClose}>
      <DetailsPage setDraftItem={setDraftItem} draftItem={draftItem} workspaceData={workspaceData} onClose={onClose} />
    </Modal>
  );
}
