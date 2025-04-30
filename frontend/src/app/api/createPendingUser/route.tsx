import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import PendingUserModel from "@/db/PendingUserModel";
import UserModel from "@/db/UserModel";
import dbConnect from "@/db/dbConnect";
// rate limiter
import { Redis } from "@upstash/redis";
// email
const nodemailer = require("nodemailer"); // nodemailer does not suppot es6
import { google } from "googleapis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ status: "error", message: "Missing fields" });

  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP,

  // READ/WRITE DATABASE
  try {
    await dbConnect();

    const existing = await UserModel.findOne({ "settings.email": email });
    if (existing) return NextResponse.json({ status: "error", message: "Email already in use" });

    await PendingUserModel.findOneAndReplace({ email: email }, { email, password, hashedPassword, otp, createdAt: Date.now() }, { upsert: true }); // upsert: true = if doc, then update; if no doc, then create new
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Database error" });
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
    // get access token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground" // this is required if using refresh tokens generated from oauthplayground
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
    // wrap in promise because article says "await" does not work, but other code examples use await
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err: any, token: any) => {
        if (err) reject();
        resolve(token);
      });
    });

    // create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "support@nullapay.com",
        accessToken,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });

    // send
    await transporter.sendMail({
      from: { name: "EZ Budget App", address: "support@nullapay.com" },
      to: email,
      subject: "Your 6-digit code",
      html: html,
    });

    // reset rate limit
    await redis.del(`ratelimit:${email}`);

    return NextResponse.json("success");
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Email not sent" });
  }
}
