"use client";
import { useState, useEffect } from "react";
import { useUserQuery } from "@/utils/hooks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
// components
import ErrorModal from "@/utils/components/ErrorModal";
import List from "./_components/List";
import EnterCost from "./_components/EnterCost";
import EnterName from "./_components/EnterName";
import EnterCategory from "./_components/EnterCategory";
import Details from "./_components/Details";

export default function Items() {
  const router = useRouter();
  const session = useSession();

  // if user is not authenticated, redirect to login
  // only needed for Items.tsx, as this is start_url for PWA and you want to redirect in the client (not the server); other pages uses redirect in server (in page.tsx)
  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.replace("/login"); // use router.replace for auth redirect
    }
  }, [session.status]);

  const { data, isPending, isError } = useUserQuery(session?.data?.user?.email);

  // states
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);
  const [page, setPage] = useState("list");
  const [newItem, setNewItem] = useState({
    date: "",
    cost: 0,
    description: "",
    category: "none",
    subcategory: "none",
    tags: "none",
  });

  // useEffect(() => {
  //   if (isError) setErrorModal("Unable to fetch you data. Refresh app or re-login. We apologize for the inconvenience.");
  // }, [isError]);

  return (
    <div className="appPageContainer relative z-10">
      {/*--- glow ---*/}
      <div className="z-0 absolute w-full h-full left-0 top-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-1/2 right-0 translate-y-[-50%] translate-x-[50%] w-[90%] h-[50%] rounded-full bg-white dark:bg-[#0444B7] blur-[200px] portrait:sm:dark:blur-[300px] landscape:lg:blur-[300px]"></div>
      </div>
      {/*--- content ---*/}
      <div className="relative z-10 w-full flex flex-col items-center">
        {page === "list" && <List setPage={setPage} setErrorModal={setErrorModal} data={data} setNewItem={setNewItem} />}
        {page === "cost" && <EnterCost setPage={setPage} setErrorModal={setErrorModal} setNewItem={setNewItem} />}
        {page === "name" && <EnterName setPage={setPage} setErrorModal={setErrorModal} setNewItem={setNewItem} />}
        {page === "category" && (
          <EnterCategory setPage={setPage} setErrorModal={setErrorModal} data={data} newItem={newItem} setNewItem={setNewItem} />
        )}
        {page === "details" && (
          <Details setPage={setPage} setErrorModal={setErrorModal} data={data} newItem={newItem} setNewItem={setNewItem} />
        )}
        {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
      </div>
    </div>
  );
}
