"use client";
import { useState, useEffect } from "react";
import { useUserQuery } from "@/utils/hooks";
import { useSession } from "next-auth/react";
// components
import ErrorModal from "@/utils/components/ErrorModal";
import List from "./_components/List";
import EnterCost from "./_components/EnterCost";
import EnterName from "./_components/EnterName";
import EnterCategory from "./_components/EnterCategory";
import Details from "./_components/Details";

import LoginGlow from "../../(login)/_components/LoginGlow";

export default function Items() {
  const { data: session } = useSession();
  console.log("session", session);
  const { data, isPending, isError } = useUserQuery(session?.user?.email);

  // states
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);
  const [page, setPage] = useState("list");
  const [newItem, setNewItem] = useState({ date: "", cost: 0, description: "", category: "none", subcategory: "none", tags: "none" });

  // useEffect(() => {
  //   if (isError) setErrorModal("Unable to fetch you data. Refresh app or re-login. We apologize for the inconvenience.");
  // }, [isError]);

  return (
    <div className="appPageContainer overflow-hidden overflow-y-auto text-base desktop:text-sm relative z-0">
      {page === "list" && <List setPage={setPage} setErrorModal={setErrorModal} data={data} setNewItem={setNewItem} />}
      {page === "cost" && <EnterCost setPage={setPage} setErrorModal={setErrorModal} setNewItem={setNewItem} />}
      {page === "name" && <EnterName setPage={setPage} setErrorModal={setErrorModal} setNewItem={setNewItem} />}
      {page === "category" && <EnterCategory setPage={setPage} setErrorModal={setErrorModal} data={data} newItem={newItem} setNewItem={setNewItem} />}
      {page === "details" && <Details setPage={setPage} setErrorModal={setErrorModal} data={data} newItem={newItem} setNewItem={setNewItem} />}
      {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
      {/*--- glow ---*/}
      <div className="absolute w-full h-full left-0 top-0 overflow-hidden z-[-1]">
        <div className="absolute top-1/2 right-0 translate-y-[-50%] translate-x-[50%] w-[90%] h-[50%] rounded-full bg-white dark:bg-[#0444B7] blur-[200px] portrait:sm:dark:blur-[300px] landscape:lg:blur-[300px] pointer-events-none"></div>
      </div>
    </div>
  );
}
