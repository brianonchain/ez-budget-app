import ItemsClient from "./ItemsClient";
import prisma from "@/utils/prisma";

export default async function page() {
  // const data = await prisma.rate.findMany({ orderBy: { id: "desc" }, take: 1 });

  // await new Promise(() => {});

  return <ItemsClient />;
}
