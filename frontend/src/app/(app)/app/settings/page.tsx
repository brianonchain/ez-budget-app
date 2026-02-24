import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { redirect } from "next/navigation";
import SettingsShell from "./SettingsShell";
import SettingsClient from "./SettingsClient";

export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session || !session.provider || !session.user?.email) redirect("/login");

  return (
    <SettingsShell>
      <SettingsClient provider={session.provider} email={session.user.email} />
    </SettingsShell>
  );
}
