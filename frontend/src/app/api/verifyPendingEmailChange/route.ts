import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions"; // Adjust to your actual path
// db
import UserModel from "@/db/UserModel";
import PendingEmailChangeModel from "@/db/PendingEmailChange";
import dbConnect from "@/db/dbConnect";
import { normalizeEmail } from "@/utils/functions";
import { hashOtp } from "@/utils/serverFunctions";
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
  const { newEmail, otp } = await req.json();
  // check input types
  const _newEmail = normalizeEmail(String(newEmail || ""));
  const _otp = String(otp || "");
  if (!_newEmail || !_otp) return NextResponse.json({ status: "error", message: "Missing fields." }, { status: 400 });

  // check authentication
  const session = await getServerSession(authOptions);
  const oldEmail = session?.user?.email;
  if (!oldEmail) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });

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

    // 1. verify otp
    const pending = await PendingEmailChangeModel.findOne({ oldEmail: oldEmail, newEmail: _newEmail });
    if (!pending || pending.otpExpiresAt < new Date()) {
      return NextResponse.json({ status: "error", message: "Your verification session has expired. Please try again." }, { status: 410 });
    }

    // 2. verify otp is correct
    if (hashOtp(_otp) !== pending.hashedOtp) {
      return NextResponse.json({ status: "error", message: "Invalid code" }, { status: 401 });
    }

    await UserModel.updateOne({ "settings.email": oldEmail }, { $set: { "settings.email": _newEmail } }); // make mutation
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Database error. Please try again." }, { status: 500 });
  }

  // delete PendingUser doc, return status:success even if deletion fails
  try {
    await PendingEmailChangeModel.deleteOne({ oldEmail: oldEmail, newEmail: _newEmail });
  } catch (e) {}

  return NextResponse.json({ status: "success" }, { status: 200 });
}
