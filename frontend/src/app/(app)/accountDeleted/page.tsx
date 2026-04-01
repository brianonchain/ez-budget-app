"use client";
import Link from "next/link";
import NoScrollPageGlow from "@/utils/components/NoScrollPageGlow";

export default function AccountDeletedPage() {
  return (
    <div className="relative px-6 w-full min-h-screen flex flex-col items-center justify-center text-center">
      <NoScrollPageGlow />

      <h1 className="textXl font-semibold">Account deleted</h1>

      <p className="mt-6 textLg opacity-80">Your EZ Budget account has been permanently removed.</p>

      <Link className="mt-12 textLg desktop:text-base linkColor" href="/login">
        Create a new account
      </Link>
    </div>
  );
}
