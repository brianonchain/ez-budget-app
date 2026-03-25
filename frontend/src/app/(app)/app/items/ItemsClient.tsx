"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useItemsQuery, useSettingsQuery } from "@/utils/hooks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
// components
import ItemsShell from "./ItemsShell";
import AddItemButton from "./_components/AddItemButton";
import ErrorModal from "@/utils/components/ErrorModal";
import EnterCost from "./_components/EnterCost";
import EnterName from "./_components/EnterName";
import Details from "./_components/Details";
import Loading from "./loading";
import Spinner from "@/utils/components/Spinner";
// constants
import { SYMBOLS, DECIMALS } from "@/utils/constants";
// types
import { DraftItem } from "@/utils/types";
import { emptyItem } from "@/utils/constants";

export default function Items() {
  const router = useRouter();
  const session = useSession();

  // if user is not authenticated, redirect to login
  // only needed for Items.tsx, as this is start_url for PWA and you want to redirect in the client (not the server); other pages can redirect in server (i.e., in page.tsx)
  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.replace("/login"); // use router.replace for auth redirect
    }
  }, [session.status]);

  const { data: itemsData, fetchNextPage, hasNextPage, isFetchingNextPage } = useItemsQuery(session?.data?.user?.email); // itemsData = { pages: [{items, defaultCurrency, hasMore},...], pageParams: [0,1,2,...] }
  const { data: settingsData } = useSettingsQuery(session?.data?.user?.email);
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
      { threshold: 0 }
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
      date: new Date().toISOString(),
      currency: settingsData.workspace.defaultCurrency,
      tag: localStorage.getItem(`lastTag:${settingsData.workspace._id}`) ?? "none",
    });
    setCostModal(true);
  };

  // better UI if button is shown on first paint (then remove button if user is not "owner" or "editor")
  const isSettingsLoading = !settingsData;
  const canAddItem = ["owner", "editor"].includes(settingsData?.role ?? "");

  return (
    <>
      <ItemsShell footer={isSettingsLoading || canAddItem ? <AddItemButton onClick={addItemOnClick} disabled={isSettingsLoading} /> : null}>
        {dateGroups.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">No items yet</div>
        ) : (
          <>
            {dateGroups.map((group) => (
              <div key={group.date}>
                <div className="sticky top-0 z-10 backdrop-blur-md px-[3%] h-8 desktop:h-7 flex items-center textXs font-semibold text-textSecondary listDateColor border-b border-borderFaint">
                  {formatDateHeader(group.items[0].date)}
                </div>
                {group.items.map((item, i) => (
                  <div
                    key={item._id ?? `${group.date}-${i}`}
                    className="px-[3%] w-full listItemHeight flex items-center gap-2 border-b border-borderFaint desktop:cursor-pointer desktop:hover:bg-surface dark:desktop:hover:bg-card"
                    onClick={() => {
                      setDraftItem(item);
                      setDetailsModal(true);
                    }}
                  >
                    <div className="w-[50%] truncate">{item.description}</div>
                    <div className="w-[25%]">{SYMBOLS[item.currency] + item.cost.toFixed(DECIMALS[item.currency])}</div>
                    <div className="w-[25%] flex flex-col justify-self-end text-end text-sm desktop:text-[0.8125rem] leading-[1.2]">
                      {item.category !== "none" && <p className="">{item.category}</p>}
                      {item.subcategory !== "none" && <p className="italic text-textSecondary">{item.subcategory}</p>}
                      {item.tag !== "none" && <div className="text-buttonPrimaryBg truncate">{item.tag}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {/* sentinel for infinite scroll */}
            <div ref={sentinelRef} className="w-full h-12 flex items-center justify-center">
              {isFetchingNextPage && <Spinner />}
            </div>
          </>
        )}
      </ItemsShell>
      {costModal && settingsData && (
        <EnterCost
          setCostModal={setCostModal}
          setNameModal={setNameModal}
          setDraftItem={setDraftItem}
          workspaceId={settingsData.workspace._id}
          defaultCurrency={settingsData.workspace.defaultCurrency}
        />
      )}
      {nameModal && <EnterName setNameModal={setNameModal} setDetailsModal={setDetailsModal} setDraftItem={setDraftItem} />}
      {detailsModal && settingsData && (
        <Details setDetailsModal={setDetailsModal} setDraftItem={setDraftItem} draftItem={draftItem} settingsData={settingsData} />
      )}
      {errorMessage && <ErrorModal errorMessage={errorMessage} setErrorMessage={setErrorMessage} />}
    </>
  );
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDateHeader(isoDate: string): string {
  const d = new Date(isoDate);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
