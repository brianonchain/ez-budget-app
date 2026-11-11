import { NextResponse } from "next/server";
// db
import PendingUserModel from "@/db/PendingUserModel";
import dbConnect from "@/db/dbConnect";
// rate limit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
// utils
import { normalizeEmail, checkEmail } from "@/utils/functions";
import { hashOtp } from "@/utils/serverFunctions";
import { serverEnv } from "@/utils/serverEnv";

// setup redis
const redis = new Redis({
  url: serverEnv.UPSTASH_REDIS_REST_URL,
  token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
});

// setup rate limiter
const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(8, "120s"),
  analytics: true,
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  // check type
  if (!body || typeof body.email !== "string" || typeof body.otp !== "string")
    return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
  // normalize
  const email = normalizeEmail(body.email);
  const otp = body.otp;
  // exists
  if (!email || !checkEmail(email) || !otp) return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });

  try {
    await dbConnect();
    // check if doc expired
    const pending = await PendingUserModel.findOne({ email, docExpiresAt: { $gt: new Date() } });
    if (!pending)
      return NextResponse.json({ status: "error", message: "Verification session has expired. Please sign up again." }, { status: 410 });
    // check if OTP expired
    if (pending.otpExpiresAt < new Date())
      return NextResponse.json({ status: "error", message: "Code expired. Please resend verification code." }, { status: 410 });

    // verify OTP
    if (hashOtp(otp) !== pending.hashedOtp) return NextResponse.json({ status: "error", message: "Invalid code." }, { status: 401 });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "error", message: "Server error" }, { status: 500 });
  }
}
