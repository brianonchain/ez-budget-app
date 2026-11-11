"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function PWAGate({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const allowInviteFlow = token && (pathname === "/invite" || pathname === "/login"); // allow non-standalone login page for invited users
    const isTunnel = window.location.hostname.endsWith(".pinggy.link");
    const skipInLocalDev = process.env.NODE_ENV === "development" && !isTunnel;

    if (!allowInviteFlow && !isDesktop && !isStandalone && !skipInLocalDev) router.replace("/saveAppToHome");
  }, []);

  return <>{children}</>;
}
