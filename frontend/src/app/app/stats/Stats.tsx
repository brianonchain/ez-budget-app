"use client";
import { useState, useEffect } from "react";
import { useUserQuery } from "@/utils/hooks";
import ErrorModal from "@/utils/components/ErrorModal";

export default function Stats() {
  const { data: user, isPending, isError } = useUserQuery();

  // states
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);

  // useEffect(() => {
  //   if (isError) setErrorModal("Unable to fetch you data. Refresh app or re-login. We apologize for the inconvenience.");
  // }, [isError]);

  return <div className="appPageContainer h-screen justify-center">Under construction...</div>;
}
