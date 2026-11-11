import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
// db
import UserModel from "@/db/UserModel";
import PendingEmailChangeModel from "@/db/PendingEmailChange";
import dbConnect from "@/db/dbConnect";
// utils
import { normalizeEmail, checkEmail } from "@/utils/functions";
import { getUserInfo, hashOtp } from "@/utils/serverFunctions";
// rate limit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// setup redis
// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });

// setup rate limiter: 5 requests per minute per email
// const rateLimiter = new Ratelimit({
//   redis,
//   limiter: Ratelimit.fixedWindow(8, "3 m"), // 8 attempts per lifetime of OTP
//   analytics: true,
// });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  // check type
  if (!body || typeof body.newEmail !== "string" || typeof body.otp !== "string")
    return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
  // normalize
  const newEmail = normalizeEmail(body.newEmail);
  const otp = body.otp.trim();
  // exists
  if (!newEmail || !otp || !checkEmail(newEmail))
    return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });

  // check authentication
  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId, userEmail } = userInfo;
  if (!userEmail) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });

  // rate limit
  // const { success } = await rateLimiter.limit(newEmail);
  // if (!success) {
  //   return NextResponse.json(
  //     {
  //       status: "error",
  //       message: "Too many attempts, please resend email to request a new OTP.",
  //     },
  //     { status: 429 }
  //   );
  // }

  try {
    await dbConnect();
    // check if doc expired
    const pending = await PendingEmailChangeModel.findOne({ oldEmail: userEmail, newEmail, docExpiresAt: { $gt: new Date() } });
    if (!pending)
      return NextResponse.json({ status: "error", message: "Your verification session has expired. Please try again." }, { status: 410 });
    // check if otp expired
    if (pending.otpExpiresAt < new Date())
      return NextResponse.json({ status: "error", message: "Code expired. Please resend verification code." }, { status: 410 });
    // verify otp
    if (hashOtp(otp) !== pending.hashedOtp) return NextResponse.json({ status: "error", message: "Invalid code" }, { status: 401 });
    // update user email
    await UserModel.updateOne({ email: userEmail }, { $set: { email: newEmail } });
  } catch {
    return NextResponse.json({ status: "error", message: "Database error. Please try again." }, { status: 500 });
  }

  // delete pending doc (non-critical)
  try {
    await PendingEmailChangeModel.deleteOne({ oldEmail: userEmail, newEmail });
  } catch {}
  return NextResponse.json({ status: "success" }, { status: 200 });
}
