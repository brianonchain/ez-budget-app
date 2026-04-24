"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useItemsQuery, useWorkspaceQuery } from "@/utils/hooks";
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

export type ModalName = "cost" | "name" | "details" | null;
export type Direction = 1 | -1 | 0;

export default function Items() {
  const router = useRouter();
  const session = useSession();

  const { data: itemsData, fetchNextPage, hasNextPage, isFetchingNextPage } = useItemsQuery(); // itemsData = { pages: [{items, defaultCurrency, hasMore},...], pageParams: [0,1,2,...] }
  const { data: workspaceData } = useWorkspaceQuery(itemsData?.pages[0]?.activeWorkspaceId ?? null);

  // measure performance
  const [itemsTime, setItemsTime] = useState<number | null>(null);
  const [settingsTime, setSettingsTime] = useState<number | null>(null);
  useEffect(() => {
    if (itemsData && itemsTime === null) {
      setItemsTime(performance.now());
    }
  }, [itemsData, itemsTime]);
  useEffect(() => {
    if (workspaceData && settingsTime === null) {
      setSettingsTime(performance.now());
    }
  }, [workspaceData, settingsTime]);

  // states
  const [errorMessage, setErrorMessage] = useState("");
  const [draftItem, setDraftItem] = useState<DraftItem>(emptyItem);
  const [modalName, setModalName] = useState<"cost" | "name" | "details" | null>(null);
  const [direction, setDirection] = useState<Direction>(1);
  const [canDetailsGoBack, setCanDetailsGoBack] = useState(true);

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
    if (!workspaceData) return;
    setDraftItem({
      ...emptyItem,
      date: new Date().toISOString(), // UTC string format
      currency: workspaceData.workspace.defaultCurrency,
      tag: localStorage.getItem(`lastTag:${workspaceData.workspace._id}`) ?? "none",
    });
    setDirection(1);
    setModalName("cost");
  };

  function goForward(nextPage: ModalName) {
    setDirection(1);
    setModalName(nextPage);
  }

  function goBack(prevPage: ModalName) {
    setDirection(-1);
    setModalName(prevPage);
  }

  function onClose() {
    setDirection(0);
    setModalName(null);
  }

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
                      setDirection(1);
                      setCanDetailsGoBack(false);
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
            <div className="fixed bottom-50 right-3 z-50 rounded-lg bg-black/70 px-3 py-2 text-xs text-white backdrop-blur-sm space-y-1">
              <div>Items: {itemsTime?.toFixed(0) ?? "NA"} ms</div>
              <div>Settings: {settingsTime?.toFixed(0) ?? "NA"} ms</div>
            </div>
          </>
        )}
      </ItemsShell>

      {/* --- MODALS --- */}
      <AnimatePresence custom={direction}>
        {modalName === "cost" && workspaceData && (
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
        {modalName === "details" && workspaceData && (
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
      {errorMessage && <ErrorModal errorMessage={errorMessage} setErrorMessage={setErrorMessage} />}
    </>
  );
}
