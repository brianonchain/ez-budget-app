"use client";
import { useState, useEffect } from "react";
import { useUserQuery } from "@/utils/hooks";
import ErrorModal from "@/utils/components/ErrorModal";

export default function Stats() {
  // states
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);

  return <div className="appPageContainer justify-center">Under construction...</div>;
}
