import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions"; // Adjust to your actual path
// db
import UserModel from "@/db/UserModel";
import PendingEmailChangeModel from "@/db/PendingEmailChange";
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
  const { newEmail, otp } = await req.json();
  if (!newEmail || !otp) return NextResponse.json({ status: "error", message: "Missing fields" });
  console.log("newEmail", newEmail, "otp", otp);

  // check authentication
  const session = await getServerSession(authOptions);
  const oldEmail = session?.user?.email;
  if (!oldEmail) return NextResponse.json({ status: "error", message: "Unauthorized" });

  // rate limit
  const { success } = await rateLimiter.limit(newEmail);
  if (!success) {
    return NextResponse.json({ status: "error", message: "Too many attempts, please resend email to request a new OTP." });
  }

  try {
    await dbConnect();

    // verify otp
    const doc = await PendingEmailChangeModel.findOne({ email: newEmail });
    console.log("pendingEmailChange doc", doc);
    if (!doc) return NextResponse.json({ status: "error", message: "6-digit code expired" });
    if (!otp === doc.otp) return NextResponse.json({ status: "error", message: "Invalid 6-digit code" });

    await UserModel.findOneAndUpdate({ "settings.email": oldEmail }, { "settings.email": newEmail }); // make mutation
    console.log("successfully updated");
  } catch (e) {
    return Response.json({ status: "error", message: "database error" });
  }

  // delete PendingUser doc, return status:success even if deletion fails
  try {
    await PendingEmailChangeModel.deleteOne({ email: newEmail });
  } catch (e) {}

  return Response.json({ status: "success" });
}
