import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
// db
import PendingUserModel from "@/db/PendingUserModel";
import UserModel from "@/db/UserModel";
import dbConnect from "@/db/dbConnect";
// rate limiter
import { Redis } from "@upstash/redis";
// utils
import { generateOtp, normalizeEmail } from "@/utils/functions";
import { hashOtp, getGmailTransporter } from "@/utils/serverFunctions";
import { serverEnv } from "@/utils/serverEnv";

const redis = new Redis({
  url: serverEnv.UPSTASH_REDIS_REST_URL,
  token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const _email = normalizeEmail(String(email || ""));
  const _password = String(password || ""); // bcrypt expects string

  if (!_email || !_password) return NextResponse.json({ status: "error", message: "Missing fields." }, { status: 400 });
  if (_email.includes(" ")) return NextResponse.json({ status: "error", message: "Invalid email." }, { status: 400 });

  // READ/WRITE DATABASE
  let otp: string;
  try {
    await dbConnect();

    const user = await UserModel.findOne({ "settings.email": _email });
    if (user) return NextResponse.json({ status: "error", message: "Email already in use" }, { status: 409 });

    const hashedPassword = await bcrypt.hash(_password, 12);
    otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await PendingUserModel.updateOne(
      { email: _email },
      {
        $set: {
          email: _email,
          hashedPassword,
          hashedOtp,
          otpExpiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
          docExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      },
      { upsert: true } // this means update or insert (if doc, then update; if no doc, then insert new)
    );
  } catch {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }

  const html = `
  <div>
    <p>Thank you for using the EZ Budget App (a subproject of Nulla Pay).</p>
    <p>Your 6-digit code is:</p>
    <p style="font-size:20px;font-weight:bold;">${otp}</p>
    <p>This code will expire in 2 minutes.</p>
    <p>Sincerely,<br/>The EZ Budget App & Nulla Pay Team</p>
  </div>
`;

  // SEND EMAIL
  try {
    const transporter = await getGmailTransporter();
    await transporter.sendMail({
      from: { name: "EZ Budget App", address: "support@nullapay.com" },
      to: _email,
      subject: "Your 6-digit code",
      html: html,
    });

    // reset rate limit
    // await redis.del(`ratelimit:${_email}`);

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (e) {
    console.log("error", e);
    try {
      await PendingUserModel.deleteOne({ email: _email });
    } catch (e) {} // not critical if error, as doc self-deletes in 10 minutes
    return NextResponse.json(
      {
        status: "error",
        message:
          "There was an error sending the 6-digit verification code to your email. Please try registering again or notify support@nullapay.com.",
      },
      { status: 500 }
    );
  }
}
