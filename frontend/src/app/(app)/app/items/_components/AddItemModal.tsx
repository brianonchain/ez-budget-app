import { useState } from "react";
import Modal from "@/utils/components/modal/Modal";
import EnterCostPage from "./EnterCostPage";
import EnterNamePage from "./EnterNamePage";
import DetailsPage from "./DetailsPage";
import type { WorkspaceData, DraftItem } from "@/utils/types";

type PageKey = "cost" | "name" | "details";

const pageMap: Record<PageKey, { title: string; back?: PageKey }> = {
  cost: { title: "Enter Cost" },
  name: { title: "Enter Name", back: "cost" },
  details: { title: "Item Info", back: "name" },
};

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
  const [pageKey, setPageKey] = useState<PageKey>("cost");
  const [direction, setDirection] = useState<1 | -1>(1); // 1=forward, -1=back

  const { title, back } = pageMap[pageKey];

  function onNext(nextPage: PageKey) {
    setDirection(1);
    setPageKey(nextPage);
  }

  function onBack(prevPage: PageKey) {
    setDirection(-1);
    setPageKey(prevPage);
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      // multipage modal
      pageKey={pageKey}
      direction={direction}
      onBack={back ? () => onBack(back) : undefined}
    >
      {pageKey === "cost" && (
        <EnterCostPage
          setDraftItem={setDraftItem}
          workspaceId={workspaceData.workspace._id}
          defaultCurrency={workspaceData.workspace.defaultCurrency}
          onNext={() => onNext("name")}
        />
      )}
      {pageKey === "name" && <EnterNamePage setDraftItem={setDraftItem} onNext={() => onNext("details")} />}
      {pageKey === "details" && (
        <DetailsPage setDraftItem={setDraftItem} draftItem={draftItem} workspaceData={workspaceData} onClose={onClose} />
      )}
    </Modal>
  );
}
