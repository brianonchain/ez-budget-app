import Stats from "./Stats";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session || !session.provider || !session.user?.email || !session.userId) redirect("/login");

  return <Stats />;
}
