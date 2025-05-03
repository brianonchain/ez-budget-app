import Settings from "./Settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await getServerSession(authOptions);
  console.log("/app/settings/page.tsx, server session", session);
  if (!session || !session.provider || !session.user?.email) redirect("/login");

  return <Settings provider={session.provider} email={session.user.email} />;
}
