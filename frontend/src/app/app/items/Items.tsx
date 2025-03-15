"use client";
import { useState, useEffect } from "react";
import { useUserQuery } from "@/utils/hooks";
// components
import ErrorModal from "@/utils/components/ErrorModal";
import List from "./_components/List";
import EnterCost from "./_components/EnterCost";
import EnterName from "./_components/EnterName";
import EnterCategory from "./_components/EnterCategory";
import Details from "./_components/Details";

export default function Items() {
  const { data, isPending, isError } = useUserQuery();

  // states
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);
  const [page, setPage] = useState("list");
  const [newItem, setNewItem] = useState({ date: "", cost: 0, description: "", category: "none", subcategory: "none", tags: "none" });

  // useEffect(() => {
  //   if (isError) setErrorModal("Unable to fetch you data. Refresh app or re-login. We apologize for the inconvenience.");
  // }, [isError]);

  return (
    <div className="appPageContainer overflow-hidden overflow-y-auto text-base desktop:text-sm">
      {page === "list" && <List setPage={setPage} setErrorModal={setErrorModal} data={data} setNewItem={setNewItem} />}
      {page === "cost" && <EnterCost page={page} setPage={setPage} setErrorModal={setErrorModal} setNewItem={setNewItem} />}
      {page === "name" && <EnterName page={page} setPage={setPage} setErrorModal={setErrorModal} setNewItem={setNewItem} />}
      {page === "category" && <EnterCategory page={page} setPage={setPage} setErrorModal={setErrorModal} data={data} newItem={newItem} setNewItem={setNewItem} />}
      {page === "details" && <Details page={page} setPage={setPage} setErrorModal={setErrorModal} data={data} newItem={newItem} setNewItem={setNewItem} />}

      {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
    </div>
  );
}
