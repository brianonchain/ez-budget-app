import { useState } from "react";
import type { Direction } from "@/utils/types";
import Modal from "@/utils/components/modal/Modal";
import EnterCostPage from "./EnterCostPage";
import EnterNamePage from "./EnterNamePage";
import DetailsPage from "./DetailsPage";
import type { WorkspaceData, DraftItem } from "@/utils/types";

type AddItemPage = "cost" | "name" | "details";

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
  const [page, setPage] = useState<AddItemPage>("cost");
  const [direction, setDirection] = useState<Direction>(0);

  function onNext(nextPage: AddItemPage) {
    setDirection(1);
    setPage(nextPage);
  }

  function onBack(prevPage: AddItemPage) {
    setDirection(-1);
    setPage(prevPage);
  }

  return (
    <Modal
      title={page === "cost" ? "Enter Cost" : page === "name" ? "Enter Name" : "Item Info"}
      onClose={onClose}
      // multipage modal
      pageKey={page}
      direction={direction}
      onBack={page === "name" ? () => onBack("cost") : page === "details" ? () => onBack("name") : undefined}
    >
      {page === "cost" && (
        <EnterCostPage
          setDraftItem={setDraftItem}
          workspaceId={workspaceData.workspace._id}
          defaultCurrency={workspaceData.workspace.defaultCurrency}
          onNext={() => onNext("name")}
        />
      )}
      {page === "name" && <EnterNamePage setDraftItem={setDraftItem} onNext={() => onNext("details")} />}
      {page === "details" && (
        <DetailsPage setDraftItem={setDraftItem} draftItem={draftItem} workspaceData={workspaceData} onClose={onClose} />
      )}
    </Modal>
  );
}
