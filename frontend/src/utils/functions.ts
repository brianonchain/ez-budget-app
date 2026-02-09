import { CategoryObject } from "@/db/UserModel";
import { jobs } from "googleapis/build/src/apis/jobs";

export function addId(arr: CategoryObject[]) {
  return arr.slice(1).map((i, index) => ({ id: (index + 1).toString(), ...i }));
}

export function checkEmail(rawEmail: string): boolean {
  const email = rawEmail.trim();
  if (email.includes(" ")) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  return parts[1].includes(".");
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

  if (!res.ok) {
    throw new Error(resJson?.message || "Server error. Please try again."); // throw if not 200-299 status
  }

  // so users will not see "cannot read properties of null" error message for resJson.status and resJson.message
  if (resJson === null) {
    throw new Error("Server error. Please try again.");
  }

  return resJson;
}

export async function fetchGet(url: string) {
  const res = await fetch(url);
  const resJson = await res.json().catch(() => null); // parses JSON and prevents crash if it fails
  // throw error if not 200-299 status
  if (!res.ok) {
    throw new Error(resJson?.message || "Server error. Please try again.");
  }
  // throw error if resJson=null, to prevent "cannot read properties of null" error message (resJson.status and resJson.message used in frontend)
  if (resJson === null) {
    throw new Error("Server error. Please try again.");
  }

  return resJson;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// OTP functions

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isSixDigitOtp(otp: string) {
  return /^\d{6}$/.test(otp);
}

import { randomInt } from "crypto";
export function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}
