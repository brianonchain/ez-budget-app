"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useItemsQuery, useSettingsQuery } from "@/utils/hooks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
// components
import ItemsShell from "./ItemsShell";
import AddItemButton from "./_components/AddItemButton";
import ErrorModal from "@/utils/components/ErrorModal";
import EnterCostModal from "./_components/EnterCostModal";
import EnterNameModal from "./_components/EnterNameModal";
import DetailsModal from "./_components/DetailsModal";
import Loading from "./loading";
import Spinner from "@/utils/components/Spinner";
// constants
import { SYMBOLS, DECIMALS } from "@/utils/constants";
// types
import { DraftItem } from "@/utils/types";
import { emptyItem } from "@/utils/constants";

function formatDateHeader(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

export default function Items() {
  const router = useRouter();
  const session = useSession();

  const { data: itemsData, fetchNextPage, hasNextPage, isFetchingNextPage } = useItemsQuery(); // itemsData = { pages: [{items, defaultCurrency, hasMore},...], pageParams: [0,1,2,...] }
  const { data: settingsData } = useSettingsQuery(itemsData?.pages[0]?.activeWorkspaceId ?? null);

  // measure performance
  const [itemsTime, setItemsTime] = useState<number | null>(null);
  const [settingsTime, setSettingsTime] = useState<number | null>(null);
  useEffect(() => {
    if (itemsData && itemsTime === null) {
      setItemsTime(performance.now());
    }
  }, [itemsData, itemsTime]);
  useEffect(() => {
    if (settingsData && settingsTime === null) {
      setSettingsTime(performance.now());
    }
  }, [settingsData, settingsTime]);

  // states
  const [errorMessage, setErrorMessage] = useState("");
  const [costModal, setCostModal] = useState(false);
  const [nameModal, setNameModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [draftItem, setDraftItem] = useState<DraftItem>(emptyItem);

  // flatten pages into a single items array, then group by date
  const allItems = useMemo(() => itemsData?.pages.flatMap((p) => p.items) ?? [], [itemsData]);
  const dateGroups = useMemo(() => {
    const groups: { date: string; items: DraftItem[] }[] = [];
    for (const item of allItems) {
      const d = item.date.slice(0, 10);
      if (groups.length === 0 || groups[groups.length - 1].date !== d) {
        groups.push({ date: d, items: [item] });
      } else {
        groups[groups.length - 1].items.push(item);
      }
    }
    return groups;
  }, [allItems]);

  // if user is not authenticated, redirect to login
  // only needed for Items.tsx, as this is start_url for PWA and you want to redirect in the client (not the server); other pages can redirect in server (i.e., in page.tsx)
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

  if (!itemsData) {
    return <Loading />;
  }

  const addItemOnClick = () => {
    if (!settingsData) return;
    setDraftItem({
      ...emptyItem,
      date: new Date().toISOString(), // UTC string format
      currency: settingsData.workspace.defaultCurrency,
      tag: localStorage.getItem(`lastTag:${settingsData.workspace._id}`) ?? "none",
    });
    setCostModal(true);
  };

  // better UI if button is shown on first paint (then remove button if user is not "owner" or "editor")
  const isItemsLoading = !itemsData;
  const canAddItem = ["owner", "editor"].includes(itemsData?.pages[0]?.role ?? "");

  return (
    <>
      <ItemsShell footer={isItemsLoading || canAddItem ? <AddItemButton onClick={addItemOnClick} disabled={isItemsLoading} /> : null}>
        {dateGroups.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">No items yet</div>
        ) : (
          <>
            {dateGroups.map((group) => (
              <div key={group.date}>
                <div className="sticky top-0 z-[1] backdrop-blur-md px-[3%] h-8 desktop:h-7 flex items-center textXs font-semibold text-textSecondary bg-surface dark:bg-card border-b border-borderFaint">
                  {formatDateHeader(group.items[0].date)}
                </div>
                {group.items.map((item, i) => (
                  <button
                    key={item._id ?? `${group.date}-${i}`}
                    className="innerOutline text-left px-[3%] w-full h-14 desktop:h-13 flex items-center gap-2 border-b border-borderFaint desktop:hover:bg-surface dark:desktop:hover:bg-card"
                    onClick={() => {
                      setDraftItem(item);
                      setDetailsModal(true);
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
            <div className="fixed bottom-50 right-3 z-50 rounded-lg bg-black/70 px-3 py-2 text-xs text-white backdrop-blur-sm space-y-1">
              <div>Items: {itemsTime?.toFixed(0) ?? "NA"} ms</div>
              <div>Settings: {settingsTime?.toFixed(0) ?? "NA"} ms</div>
            </div>
          </>
        )}
      </ItemsShell>
      {costModal && settingsData && (
        <EnterCostModal
          setCostModal={setCostModal}
          setNameModal={setNameModal}
          setDraftItem={setDraftItem}
          workspaceId={settingsData.workspace._id}
          defaultCurrency={settingsData.workspace.defaultCurrency}
        />
      )}
      {nameModal && <EnterNameModal setNameModal={setNameModal} setDetailsModal={setDetailsModal} setDraftItem={setDraftItem} />}
      <AnimatePresence>
        {detailsModal && settingsData && (
          <DetailsModal setDetailsModal={setDetailsModal} setDraftItem={setDraftItem} draftItem={draftItem} settingsData={settingsData} />
        )}
      </AnimatePresence>
      {errorMessage && <ErrorModal errorMessage={errorMessage} setErrorMessage={setErrorMessage} />}
    </>
  );
}
