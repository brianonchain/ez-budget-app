import { NextResponse } from "next/server";
// db
import UserModel from "@/db/UserModel";
import PendingUserModel from "@/db/PendingUserModel";
import dbConnect from "@/db/dbConnect";
// rate limit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// setup redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// setup rate limiter: 5 requests per minute per email
const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(8, "120s"), // 5 attempts per 60 seconds
  analytics: true,
});

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ status: "error", message: "Missing fields" }, { status: 400 });

  const { success } = await rateLimiter.limit(email);
  if (!success) {
    return NextResponse.json({ status: "error", message: "Too many attempts, please resend email to request a new OTP." }, { status: 429 });
  }

  await dbConnect();

  const existing = await UserModel.findOne({ "settings.email": email });
  if (existing) return NextResponse.json({ status: "error", message: "User already exists" }, { status: 400 });

  const doc = await PendingUserModel.findOne({ email: email });
  if (!doc) return NextResponse.json({ status: "error", message: "OTP expired" }, { status: 400 }); // doc self-deletes in 5min

  const isValidOtp = otp === doc.otp;
  if (!isValidOtp) return NextResponse.json({ status: "error", message: "Invalid OTP" }, { status: 400 });

  // create user
  await UserModel.create({
    hashedPassword: doc.hashedPassword,
    "settings.email": email,
    "settings.currency": "",
    "settings.category": { none: ["none"] },
    "settings.tags": ["none"],
    items: [],
  });

  // delete PendingUser doc
  await PendingUserModel.deleteOne({ email: email });

  return NextResponse.json({ status: "success", data: doc.password });
}
