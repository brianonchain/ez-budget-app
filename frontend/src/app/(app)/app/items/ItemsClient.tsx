"use client";
import { useState, useEffect } from "react";
import { useUserQuery } from "@/utils/hooks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
// components
import AddItemButton from "./_components/AddItemButton";
import ErrorModal from "@/utils/components/ErrorModal";
import EnterCost from "./_components/EnterCost";
import EnterName from "./_components/EnterName";
import Details from "./_components/Details";
import Loading from "./loading";
// types
import { Item } from "@/db/UserModel";
import ItemsShell from "./ItemsShell";

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

  const { data, isPending, isError } = useUserQuery(session?.data?.user?.email);

  // states
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);
  const [costModal, setCostModal] = useState(false);
  const [nameModal, setNameModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [newItem, setNewItem] = useState<Item>({
    date: new Date(),
    cost: 0,
    currency: "USD",
    description: "",
    category: "none",
    subcategory: "none",
    tags: "none",
  });

  // useEffect(() => {
  //   if (isError) setErrorModal("Unable to fetch you data. Refresh app or re-login. We apologize for the inconvenience.");
  // }, [isError]);

  if (!data) {
    return <Loading />;
  }

  const addItemOnClick = () => {
    setNewItem({
      date: new Date(),
      cost: 0,
      currency: data.settings.defaultCurrency,
      description: "",
      category: "none",
      subcategory: "none",
      tags: "none",
    });
    console.log("addItemOnClick,newItem", newItem);
    setCostModal(true);
  };

  return (
    <>
      <ItemsShell footer={<AddItemButton onClick={addItemOnClick} />}>
        {data.items.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">No items yet</div>
        ) : (
          <>
            {data.items.map((item: Item, index: number) => (
              <div
                key={index}
                className="px-[3%] w-full listItemHeight grid grid-cols-[50%_20%_30%] items-center border-t-[1.5px] border-slate-200 dark:border-white/5 desktop:cursor-pointer desktop:hover:bg-lightBg2 dark:desktop:hover:bg-blue-500/10"
                onClick={() => {
                  setNewItem(item);
                  setDetailsModal(true);
                }}
              >
                <div className="">{item.description}</div>
                <div className="">{item.cost}</div>
                <div className="flex flex-col justify-self-end text-end">
                  {item.category !== "none" && <p className="font-medium leading-tight">{item.category}</p>}
                  {item.subcategory !== "none" && (
                    <p className="italic text-sm desktop:text-xs leading-tight text-slate-500 dark:text-slate-400">{item.subcategory}</p>
                  )}
                  {item.tags !== "none" && (
                    <div className="text-sm desktop:text-xs leading-tight text-lightButton1Bg dark:text-darkButton1Bg truncate">
                      {item.tags}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </ItemsShell>
      {costModal && <EnterCost setCostModal={setCostModal} setNameModal={setNameModal} setNewItem={setNewItem} />}
      {nameModal && <EnterName setNameModal={setNameModal} setDetailsModal={setDetailsModal} setNewItem={setNewItem} />}
      {detailsModal && <Details setDetailsModal={setDetailsModal} data={data} newItem={newItem} setNewItem={setNewItem} />}
      {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
    </>
  );
}
