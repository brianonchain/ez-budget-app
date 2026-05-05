"use client";
import { AnimatePresence } from "framer-motion";
// components
import Backdrop from "@/utils/components/modal/Backdrop";
import EnterCostModal from "./EnterCostModal";
import EnterNameModal from "./EnterNameModal";
import DetailsModal from "./DetailsModal";
import { ModalName } from "../ItemsClient";
import { DraftItem, WorkspaceData, Direction } from "@/utils/types";

export default function ItemsModals({
  modalName,
  canDetailsGoBack,
  workspaceData,
  draftItem,
  setDraftItem,
  direction,
  onClose,
  goBack,
  goForward,
  setCanDetailsGoBack,
}: {
  modalName: ModalName;
  canDetailsGoBack: boolean;
  workspaceData: WorkspaceData;
  draftItem: DraftItem;
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
  direction: Direction;
  onClose: () => void;
  goBack: (prevPage: ModalName) => void;
  goForward: (nextPage: ModalName) => void;
  setCanDetailsGoBack: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      <AnimatePresence>{modalName && canDetailsGoBack && <Backdrop />}</AnimatePresence>
      <AnimatePresence custom={direction}>
        {modalName === "cost" && (
          <EnterCostModal
            setDraftItem={setDraftItem}
            workspaceId={workspaceData.workspace._id}
            defaultCurrency={workspaceData.workspace.defaultCurrency}
            onClose={onClose}
            direction={direction}
            onForward={() => goForward("name")}
          />
        )}
      </AnimatePresence>
      <AnimatePresence custom={direction}>
        {modalName === "name" && (
          <EnterNameModal
            setDraftItem={setDraftItem}
            onClose={onClose}
            direction={direction}
            onBack={() => goBack("cost")}
            onForward={() => {
              setCanDetailsGoBack(true);
              goForward("details");
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence custom={direction}>
        {modalName === "details" && (
          <DetailsModal
            setDraftItem={setDraftItem}
            draftItem={draftItem}
            workspaceData={workspaceData}
            onClose={onClose}
            direction={direction}
            onBack={canDetailsGoBack ? () => goBack("name") : undefined}
          />
        )}
      </AnimatePresence>
    </>
  );
}
