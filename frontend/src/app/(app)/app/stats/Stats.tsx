"use client";
import { useState, useEffect } from "react";
import { useUserQuery } from "@/utils/hooks";
import ErrorModal from "@/utils/components/ErrorModal";

export default function Stats() {
  // states
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);

  return (
    <div className="appPageContainer overflow-x-hidden overflow-y-auto relative z-0">
      {/*--- glow ---*/}
      <div className="absolute w-full h-full left-0 top-0 z-[-1]">
        <div className="absolute top-1/2 right-0 translate-y-[-50%] translate-x-[50%] w-[90%] h-[50%] rounded-full bg-white dark:bg-[#0444B7] blur-[200px] portrait:sm:dark:blur-[300px] landscape:lg:blur-[300px] pointer-events-none"></div>
      </div>
      <div className="w-full h-full flex justify-center items-center">Under construction...</div>
    </div>
  );
}
