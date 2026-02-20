import Items from "./Items";
import prisma from "@/utils/prisma";

export default async function page() {
  const data = await prisma.rate.findMany({ orderBy: { id: "desc" }, take: 1 });

  return <Items />;
}
