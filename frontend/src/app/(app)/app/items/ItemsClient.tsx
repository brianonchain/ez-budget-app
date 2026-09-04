"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useItemsQuery, useWorkspaceQuery } from "@/utils/hooks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
// components
import ItemsShell from "./ItemsShell";
import AddItemButton from "./_components/AddItemButton";
import Spinner from "@/utils/components/Spinner";
import ErrorModal from "@/utils/components/simpleModal/ErrorModal";
import AddItemModal from "./_components/AddItemModal";
import DetailsModal from "./_components/DetailsModal";
import PerformanceStats from "@/utils/components/PerformanceStats";
// utils
import { SYMBOLS, DECIMALS, emptyItem } from "@/utils/constants";
import { getLocalDateKey } from "@/utils/functions";
import type { DraftItem } from "@/utils/types";

function formatDateHeader(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(isoDate));
}

export default function ItemsClient() {
  const router = useRouter();
  const session = useSession();

  const { data: itemsData, fetchNextPage, hasNextPage, isFetchingNextPage } = useItemsQuery(); // itemsData = { pages: [{items, defaultCurrency, hasMore},...], pageParams: [0,1,2,...] }
  const { data: workspaceData } = useWorkspaceQuery(itemsData?.pages[0]?.activeWorkspaceId ?? null);

  // states
  const [errorMessage, setErrorMessage] = useState("");
  const [draftItem, setDraftItem] = useState<DraftItem>(emptyItem);
  const [modalName, setModalName] = useState<"details" | "addItem" | null>(null);

  console.log("modalName", modalName);

  // flatten pages into a single items array, then group by date
  const allItems = useMemo(() => itemsData?.pages.flatMap((p) => p.items) ?? [], [itemsData]);
  const dateGroups = useMemo(() => {
    const groups: { date: string; items: DraftItem[] }[] = [];
    for (const item of allItems) {
      const d = getLocalDateKey(item.date);
      if (groups.length === 0 || groups[groups.length - 1].date !== d) {
        groups.push({ date: d, items: [item] });
      } else {
        groups[groups.length - 1].items.push(item);
      }
    }
    return groups;
  }, [allItems]);

  // store defaultCurrency in localStorage (will run if data is mutated)
  useEffect(() => {
    if (!workspaceData) return;
    localStorage.setItem("ezb:workspaceId", workspaceData.workspace._id);
    localStorage.setItem("ezb:currency", workspaceData.workspace.defaultCurrency);
  }, [workspaceData?.workspace._id, workspaceData?.workspace.defaultCurrency]);

  // Because this is PWA start_url, must do unauthenticated redirects on client (not the server); other pages can redirect in server (i.e., in page.tsx)
  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.replace("/login"); // use router.replace for auth redirect
    }
  }, [session.status]);

  // infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onAddItem = () => {
    const currency = localStorage.getItem("ezb:currency");
    if (!currency) return;
    setDraftItem({
      ...emptyItem,
      date: new Date().toISOString(), // UTC string format
      currency,
      tag: localStorage.getItem("ezb:lastTag") ?? "none",
    });
    // setIsMultiPageModal(true);
    setModalName("addItem");
  };

  function onClose() {
    setModalName(null);
  }

  // add item data only shows when itemsData loaded and role is appropriate
  const canAddItem = ["owner", "editor"].includes(itemsData?.pages[0]?.role ?? "");

  return (
    <>
      <ItemsShell addItemButton={itemsData && canAddItem ? <AddItemButton onClick={onAddItem} /> : null}>
        {!itemsData ? (
          <div className="w-full h-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : dateGroups.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">No items yet</div>
        ) : (
          <>
            {/* --- backdrop blur bar (need sticky instead of absolute for backdrop blur to work) --- */}
            <div className="sticky top-0 h-8 desktop:h-7 -mb-8 desktop:-mb-7 w-full backdrop-blur-md pointer-events-none" />
            {dateGroups.map((group) => (
              <div key={group.date}>
                {/* --- date header --- */}
                <div className="sticky top-0 z-[1] px-[3%] h-8 desktop:h-7 flex items-center textXs font-semibold text-textSecondary bg-buttonOutlineBgHoverSubtle border-b border-borderFaint">
                  {formatDateHeader(group.items[0].date)}
                </div>
                {/* --- items --- */}
                {group.items.map((item, i) => (
                  <button
                    key={item._id ?? `${group.date}-${i}`}
                    className="innerOutline text-left px-[3%] w-full h-14 desktop:h-13 flex items-center gap-2 border-b border-borderFaint hover:bg-buttonOutlineBgHoverSubtle"
                    onClick={() => {
                      setDraftItem(item);
                      setModalName("details");
                    }}
                    type="button"
                  >
                    <div className="w-[50%] truncate">{item.description}</div>
                    <div className="w-[25%]">{SYMBOLS[item.currency] + item.cost.toFixed(DECIMALS[item.currency])}</div>
                    <div className="w-[25%] flex flex-col justify-self-end text-end textXs leading-[1.2]">
                      {item.category !== "none" && <p className="truncate">{item.category}</p>}
                      {item.subcategory !== "none" && <p className="italic text-textSecondary truncate">{item.subcategory}</p>}
                      {item.tag !== "none" && <div className="text-buttonPrimaryBg truncate">{item.tag}</div>}
                    </div>
                  </button>
                ))}
              </div>
            ))}
            {/* --- sentinel for infinite scroll --- */}
            <div ref={sentinelRef} className="w-full h-12 flex items-center justify-center">
              {isFetchingNextPage && <Spinner />}
            </div>
            {/* --- performance metrics --- */}
            {/* {workspaceData && <PerformanceStats isItemsData={!!itemsData} isWorkspaceData={!!workspaceData} />} */}
          </>
        )}
      </ItemsShell>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {modalName === "addItem" && workspaceData && (
          <AddItemModal setDraftItem={setDraftItem} draftItem={draftItem} workspaceData={workspaceData} onClose={onClose} />
        )}

        {modalName === "details" && workspaceData && (
          <DetailsModal setDraftItem={setDraftItem} draftItem={draftItem} workspaceData={workspaceData} onClose={onClose} />
        )}
        {errorMessage && <ErrorModal errorMessage={errorMessage} onClose={() => setErrorMessage("")} />}
      </AnimatePresence>
    </>
  );
}
