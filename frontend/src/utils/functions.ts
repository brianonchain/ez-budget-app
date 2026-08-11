import { CategoryObject } from "@/db/WorkspaceModel";

export function addId(arr: CategoryObject[]) {
  return arr.slice(1).map((i, index) => ({ id: (index + 1).toString(), ...i }));
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function checkEmail(rawEmail: string): boolean {
  const email = normalizeEmail(rawEmail);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function checkPassword(password: string): boolean {
  if (!password) return false;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // at least 8 chars, one uppercase, one lowercase, one number
  const isValid = regex.test(password);
  return isValid;
}

export async function fetchPost(url: string, body: Record<string, any>) {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Network error. Please check your connection.");
  }
  const resJson = await res.json().catch(() => null); // parses JSON and prevents crash if it fails
  // throw if not 200-299 status
  if (!res.ok) {
    throw new Error(resJson?.message || "Server error. Please try again.");
  }
  // so users will not see "cannot read properties of null" error message for resJson.status and resJson.message (if resJson=null)
  if (resJson === null) {
    throw new Error("Server error. Please try again.");
  }
  return resJson;
}

export async function fetchGet(url: string) {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("Network error. Please check your connection.");
  }
  const resJson = await res.json().catch(() => null); // parses JSON and prevents crash if it fails
  // throw error if not 200-299 status
  if (!res.ok) {
    throw new Error(resJson?.message || "Server error. Please try again.");
  }
  // so users will not see "cannot read properties of null" error message for resJson.status and resJson.message (if resJson=null)
  if (resJson === null) {
    throw new Error("Server error. Please try again.");
  }
  return resJson;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// OTP functions

export function isSixDigitOtp(otp: string) {
  return /^\d{6}$/.test(otp);
}

import { randomInt } from "crypto";
export function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function createIsUsedMsg(item: string) {
  return `This ${item} is being used in at least one item. Remove it from all items before deleting.`;
}

export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 01–12
  return `${year}-${month}`;
}

export function getLocalDateKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
