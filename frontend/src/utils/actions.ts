"use server";
import { cookies } from "next/headers";

export async function deleteCookieAction(key: string) {
  const cookieStore = await cookies();
  cookieStore.delete(key);
}
