"use client";
import { useState, useEffect } from "react";
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

  const { data: itemsData } = useItemsQuery(session?.data?.user?.email);
  const { data: settingsData } = useSettingsQuery(session?.data?.user?.email);
  // states
  const [errorMessage, setErrorMessage] = useState("");
  const [costModal, setCostModal] = useState(false);
  const [nameModal, setNameModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [draftItem, setDraftItem] = useState<DraftItem>(emptyItem);

  // useEffect(() => {
  //   if (isError) setErrorModal("Unable to fetch you data. Refresh app or re-login. We apologize for the inconvenience.");
  // }, [isError]);

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

  return (
    <>
      <ItemsShell footer={["owner", "editor"].includes(settingsData?.role ?? "") ? <AddItemButton onClick={addItemOnClick} /> : null}>
        {itemsData.items.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">No items yet</div>
        ) : (
          <>
            {itemsData.items.map((item, index) => {
              const prevDate = index > 0 ? itemsData.items[index - 1].date.slice(0, 10) : null;
              const curDate = item.date.slice(0, 10);
              const showHeader = curDate !== prevDate;

              return (
                <div key={item._id ?? index}>
                  {showHeader && (
                    <div className="sticky top-0 z-10 px-[3%] h-8 desktop:h-7 flex items-center textSm font-semibold text-textSecondary bg-surface border-b border-borderFaint">
                      {formatDateHeader(item.date)}
                    </div>
                  )}
                  <div
                    className="px-[3%] w-full listItemHeight grid grid-cols-[50%_20%_30%] items-center border-b border-borderFaint desktop:cursor-pointer desktop:hover:bg-surface"
                    onClick={() => {
                      setDraftItem(item);
                      setDetailsModal(true);
                    }}
                  >
                    <div className="">{item.description}</div>
                    <div className="">{SYMBOLS[item.currency] + item.cost.toFixed(DECIMALS[item.currency])}</div>
                    <div className="flex flex-col justify-self-end text-end textSm leading-tight desktop:leading-tight">
                      {item.category !== "none" && <p className="">{item.category}</p>}
                      {item.subcategory !== "none" && <p className="italic text-textSecondary">{item.subcategory}</p>}
                      {item.tag !== "none" && <div className="text-buttonPrimaryBg truncate">{item.tag}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
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
