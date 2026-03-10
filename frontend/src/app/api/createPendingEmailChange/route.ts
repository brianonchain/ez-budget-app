import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// db
import dbConnect from "@/db/dbConnect";
import PendingEmailChangeModel from "@/db/PendingEmailChange";
import UserModel from "@/db/UserModel";
// utils
import { authOptions } from "@/utils/authOptions";
import { generateOtp, normalizeEmail } from "@/utils/functions";
import { hashOtp, getGmailTransporter } from "@/utils/serverFunctions";

export async function POST(req: NextRequest) {
  const { newEmail } = await req.json();
  const _newEmail = normalizeEmail(String(newEmail || ""));
  if (!_newEmail) return NextResponse.json({ status: "error", message: "Missing fields." }, { status: 400 });

  // checks
  const session = await getServerSession(authOptions);
  const oldEmail = session?.user?.email;
  if (!oldEmail) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  if (_newEmail === oldEmail) {
    return NextResponse.json({ status: "error", message: "New email is the same as your current email." }, { status: 400 });
  }

  const otp = generateOtp();
  try {
    await dbConnect();
    // check if new email already taken
    const userExists = await UserModel.exists({ "settings.email": _newEmail });
    if (userExists) {
      return NextResponse.json({ status: "error", message: "Email already in use." }, { status: 409 });
    }
    // create pendingEmailChange doc
    await PendingEmailChangeModel.updateOne(
      { oldEmail: oldEmail },
      {
        $set: {
          newEmail: _newEmail,
          hashedOtp: hashOtp(otp),
          otpExpiresAt: new Date(Date.now() + 2 * 60 * 1000),
          docExpiresAt: new Date(Date.now() + 3 * 60 * 1000),
        },
        $setOnInsert: { oldEmail: oldEmail },
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
      to: _newEmail,
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
