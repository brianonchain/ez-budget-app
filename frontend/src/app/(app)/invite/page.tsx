"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import NoScrollPageGlow from "@/utils/components/NoScrollPageGlow";
import LargeSpinnerAndText from "@/utils/components/LargeSpinnerAndText";

type InviteStatus = "accepting" | "accepted" | "error";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();

  const [inviteStatus, setInviteStatus] = useState<InviteStatus>("accepting");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    // exists
    if (!token) {
      router.replace("/");
      return;
    }
    // unauthenticated
    if (session.status === "unauthenticated") {
      router.replace(`/login?token=${encodeURIComponent(token)}`);
      return;
    }
    // authenticated => fetch api/acceptInvite
    if (session.status === "authenticated") {
      acceptInvite(token);
    }

    async function acceptInvite(token: string) {
      try {
        const res = await fetch("/api/acceptInvite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const resJson = await res.json();
        if (resJson.status === "success") {
          const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
          isDesktop ? router.replace("/app/items") : setInviteStatus("accepted");
        } else {
          setInviteStatus("error");
          setErrorMessage(resJson.message || "Failed to accept invite.");
        }
      } catch {
        setInviteStatus("error");
        setErrorMessage("Failed to accept invite.");
      }
    }
  }, [session.status]);

  return (
    <div className="relative px-6 w-full min-h-screen flex flex-col items-center justify-center text-center">
      <NoScrollPageGlow />
      {inviteStatus === "accepting" && <LargeSpinnerAndText />}
      {inviteStatus === "accepted" && (
        <>
          <h1 className="text-2xl font-semibold">Invitation accepted!</h1>
          <p className="mt-12 text-xl opacity-80">Open EZ Budget from your Home Screen to continue</p>
          <Link className="mt-12 text-xl desktop:text-base link" href="/saveAppToHome">
            Download the app
          </Link>
        </>
      )}
      {inviteStatus === "error" && (
        <>
          <h1 className="text-2xl font-semibold">Unable to accept invite</h1>
          <p className="mt-6 text-xl opacity-80">{errorMessage}</p>
        </>
      )}
    </div>
  );
}
