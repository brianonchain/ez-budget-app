"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <div>
      <p>Client component: Welcome {session?.user?.name}</p>
      <button className="px-4 py-2 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-400" onClick={session ? () => signOut() : () => signIn()}>
        {session ? "Sign Out" : "Sign In"}
      </button>
    </div>
  );
}
