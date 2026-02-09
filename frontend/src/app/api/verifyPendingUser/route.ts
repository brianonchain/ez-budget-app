import { NextResponse } from "next/server";
// db
import PendingUserModel from "@/db/PendingUserModel";
import dbConnect from "@/db/dbConnect";
// rate limit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
// utils
import { normalizeEmail } from "@/utils/functions";
import { hashOtp } from "@/utils/serverFunctions";

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
  // catch-all try/catch
  try {
    const { email, otp } = await req.json();

    // check input types
    const _email = normalizeEmail(String(email || ""));
    const _otp = String(otp || "");
    if (!_email || !_otp) {
      return NextResponse.json({ status: "error", message: "Missing fields." }, { status: 400 });
    }

    // connect database and get PendingUser doc
    await dbConnect();
    const pending = await PendingUserModel.findOne({ email: _email }).select("hashedOtp otpExpiresAt");

    // if no doc (doc expires in 10 minutes)
    if (!pending) {
      return NextResponse.json(
        { status: "error", message: "Your verification session has expired. Please sign up again." },
        { status: 410 }
      );
    }

    // if OTP expired (OTP expires in 2 minutes)
    if (pending.otpExpiresAt < new Date()) {
      return NextResponse.json({ status: "error", message: "Code has expired. Please resend verification code." }, { status: 410 });
    }

    // if OTP is invalid
    if (pending.hashedOtp !== hashOtp(_otp)) {
      return NextResponse.json({ status: "error", message: "Invalid code." }, { status: 401 });
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Server error" }, { status: 500 });
  }
}
