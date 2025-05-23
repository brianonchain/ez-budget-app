import Items from "./Items";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/utils/prisma";

export default async function page() {
  const session = await getServerSession(authOptions);
  const data = await prisma.rate.findMany({ orderBy: { id: "desc" }, take: 1 });

  console.log(data);

  if (!session) redirect("/login");

  return <Items />;
}
