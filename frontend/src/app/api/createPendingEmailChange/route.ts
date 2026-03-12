import { NextRequest, NextResponse } from "next/server";
// db
import dbConnect from "@/db/dbConnect";
import PendingEmailChangeModel from "@/db/PendingEmailChange";
import UserModel from "@/db/UserModel";
// utils
import { generateOtp, normalizeEmail, checkEmail } from "@/utils/functions";
import { hashOtp, getGmailTransporter, getUserInfo } from "@/utils/serverFunctions";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  // security gate
  const userInfo = await getUserInfo();
  if (!userInfo) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }
  const { userId, userEmail } = userInfo;

  // check type
  if (!body || typeof body.newEmail !== "string") {
    return NextResponse.json({ status: "error", message: "Invalid email." }, { status: 400 });
  }
  // normalize
  const newEmail = normalizeEmail(body.newEmail);
  // exists
  if (!newEmail || !checkEmail(newEmail)) return NextResponse.json({ status: "error", message: "Invalid email." }, { status: 400 });
  // cannot be same email
  if (newEmail === userEmail)
    return NextResponse.json({ status: "error", message: "New email is the same as your current email." }, { status: 400 });

  const otp = generateOtp();
  try {
    await dbConnect();
    // check if new email already taken
    const userExists = await UserModel.exists({ email: newEmail });
    if (userExists) return NextResponse.json({ status: "error", message: "Email already in use." }, { status: 409 });

    // create pendingEmailChange doc
    await PendingEmailChangeModel.updateOne(
      { oldEmail: userEmail },
      {
        $set: {
          newEmail,
          hashedOtp: hashOtp(otp),
          otpExpiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
          docExpiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes
        },
      },
      { upsert: true }
    );
  } catch {
    return NextResponse.json({ status: "error", message: "Database error. Please try again." }, { status: 500 });
  }

  // SEND EMAIL
  const html = `
    <div>
      <p>Your 6-digit code is:</p>
      <p style="font-size:20px;font-weight:bold;">${otp}</p>
      <p>This code will expire in 2 minutes.</p>
      <p>Sincerely,<br/>The EZ Budget App & Nulla Pay Team</p>
    </div>
  `;
  try {
    const transporter = await getGmailTransporter();
    await transporter.sendMail({
      from: { name: "EZ Budget App", address: "support@nullapay.com" },
      to: newEmail,
      subject: "Your 6-digit code",
      html: html,
    });
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { status: "error", message: "Error in sending email. Please try again or notify support@nullapay.com." },
      { status: 500 }
    );
  }
}
