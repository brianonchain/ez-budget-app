import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions"; // Adjust to your actual path
import dbConnect from "@/db/dbConnect"; // Your mongoose connection helper
import PendingEmailChangeModel from "@/db/PendingEmailChange";
// rate limiter
import { Redis } from "@upstash/redis";
// email
const nodemailer = require("nodemailer"); // nodemailer does not suppot es6
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  console.log("/api/createPendingEmailChange");
  const { newEmail } = await req.json();
  if (!newEmail) return NextResponse.json({ status: "error", message: "Invalid new email" });

  // check authentication
  const session = await getServerSession(authOptions);
  const oldEmail = session?.user?.email;
  if (!oldEmail) return NextResponse.json({ status: "error", message: "Unauthorized" });

  // CREATE DOC
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await dbConnect();
    await PendingEmailChangeModel.findOneAndReplace({ email: oldEmail }, { email: newEmail, otp, createdAt: Date.now() }, { upsert: true }); // upsert: true => if no doc, then create one
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Error accessing database or creating new item" });
  }

  // SEND EMAIL
  const html = `
    <div>
      <p>Your 6-digit code for changing your email is:</p>
      <p style="font-size:20px;font-weight:bold;">${otp}</p>
      <p>This code will expire in 2 minutes.</p>
      <p>Sincerely,<br/>The EZ Budget App & Nulla Pay Team</p>
    </div>
  `;
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
      to: newEmail,
      subject: "Your 6-digit code",
      html: html,
    });
    return NextResponse.json({ status: "success" });
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Email not sent" });
  }
}
