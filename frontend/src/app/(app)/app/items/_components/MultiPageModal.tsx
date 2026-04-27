"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
// components
import ModalFlow from "@/utils/components/modal/ModalFlow";
import CostContent from "./CostContent";
import NameContent from "./NameContent";
import DetailsContent from "./DetailsContent";
// types
import type { DraftItem, WorkspaceData, Direction } from "@/utils/types";
type ModalName = "cost" | "name" | "details";

const mobileVariants = {
  initial: (direction: Direction) => ({
    x: direction === -1 ? "-30%" : "100%",
    zIndex: direction === -1 ? 110 : 112,
  }),
  animate: (direction: Direction) => ({
    x: 0,
    zIndex: direction === -1 ? 110 : 112,
  }),
  exit: (direction: Direction) => ({
    x: direction === 1 ? "-30%" : "100%",
    zIndex: direction === -1 ? 112 : 110,
  }),
};

export default function ItemsModal({
  modalName,
  setModalName,
  draftItem,
  setDraftItem,
  workspaceData,
}: {
  modalName: ModalName;
  setModalName: React.Dispatch<React.SetStateAction<ModalName | null>>;
  draftItem: DraftItem;
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
  workspaceData: WorkspaceData;
}) {
  const [direction, setDirection] = useState<Direction>(0);

  const title = modalName === "cost" ? "Enter Cost" : modalName === "name" ? "Enter Name" : "Details";

  function onClose() {
    setDirection(0);
    setModalName(null);
  }

  function goToCost() {
    setDirection(-1);
    setModalName("cost");
  }

  function goToName(direction: Direction) {
    setDirection(direction);
    setModalName("name");
  }

  function goToDetails() {
    setDirection(1);
    setModalName("details");
  }

  const onBack = modalName === "cost" ? undefined : modalName === "name" ? goToCost : () => goToName(-1);

  console.log("ItemsModal.tsx, modalName", modalName);

  return (
    <ModalFlow title={title} onClose={onClose} onBack={onBack}>
      <AnimatePresence custom={direction}>
        <motion.div
          key={modalName}
          className="absolute inset-0 overflow-y-auto thinScroll"
          custom={direction}
          variants={mobileVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 4.2,
            ease: [0.32, 0.72, 0, 1],
          }}
        >
          <div className="flex flex-col">
            {modalName === "cost" && (
              <CostContent
                setDraftItem={setDraftItem}
                defaultCurrency={workspaceData.workspace.defaultCurrency}
                workspaceId={workspaceData.workspace._id}
                onForward={() => goToName(1)}
              />
            )}

            {modalName === "name" && <NameContent setDraftItem={setDraftItem} onForward={goToDetails} />}

            {modalName === "details" && (
              <DetailsContent draftItem={draftItem} setDraftItem={setDraftItem} workspaceData={workspaceData} onClose={onClose} />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </ModalFlow>
  );
}
