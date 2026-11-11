import { NextRequest, NextResponse } from "next/server";
// db
import dbConnect from "@/db/dbConnect";
import PendingUserModel from "@/db/PendingUserModel";
import PendingEmailChangeModel from "@/db/PendingEmailChange";
import UserModel from "@/db/UserModel";
// utils
import { generateOtp, normalizeEmail, checkEmail } from "@/utils/functions";
import { hashOtp, getGmailTransporter, getUserInfo } from "@/utils/serverFunctions";
import { ResendCodePayload } from "@/utils/types";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as ResendCodePayload | null;
  if (!body || typeof body.type !== "string") return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });

  let toEmail = "";
  let otp = "";

  try {
    await dbConnect();

    switch (body.type) {
      case "resendCodeForNewUser": {
        // check type
        if (typeof body.email !== "string") {
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        }
        // normalize
        const email = normalizeEmail(body.email);
        // if exists and valid
        if (!email || !checkEmail(email)) return NextResponse.json({ status: "error", message: "Missing email." }, { status: 400 });
        // email in use
        const userExists = await UserModel.exists({ email });
        if (userExists) return NextResponse.json({ status: "error", message: "Account already exists." }, { status: 409 });
        // if pendingUserDoc expired (expires in 10 minutes)
        const pendingUser = await PendingUserModel.findOne({ email, docExpiresAt: { $gt: new Date() } });
        if (!pendingUser)
          return NextResponse.json({ status: "error", message: "Verification session expired. Please sign up again." }, { status: 404 });

        // create otp & update doc
        otp = generateOtp();
        await PendingUserModel.updateOne(
          { email },
          {
            $set: {
              hashedOtp: hashOtp(otp),
              otpExpiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
              docExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            },
          }
        );

        toEmail = email;
        break;
      }

      case "resendCodeForEmailChange": {
        // get user from next-auth
        const userInfo = await getUserInfo();
        if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
        const { userId, userEmail } = userInfo;
        // check if doc expired (expires in 3 minutes)
        const pendingEmailChange = await PendingEmailChangeModel.findOne({ oldEmail: userEmail, docExpiresAt: { $gt: new Date() } });
        if (!pendingEmailChange)
          return NextResponse.json(
            { status: "error", message: "Verification session expired. Please exit and try again." },
            { status: 404 }
          );
        // check if new email in use
        const userExists = await UserModel.exists({ email: pendingEmailChange.newEmail });
        if (userExists) return NextResponse.json({ status: "error", message: "Email already used." }, { status: 409 });
        // create otp & update doc
        otp = generateOtp();
        await PendingEmailChangeModel.updateOne(
          { oldEmail: userEmail },
          {
            $set: {
              hashedOtp: hashOtp(otp),
              otpExpiresAt: new Date(Date.now() + 2 * 60 * 1000),
              docExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
          }
        );

        toEmail = pendingEmailChange.newEmail;
        break;
      }

      default:
        return NextResponse.json({ status: "error", message: "Invalid operation type." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ status: "error", message: "Database error." }, { status: 500 });
  }

  const html = `
  <div>
    <p>Your verification code is:</p>
    <p style="font-size:20px;font-weight:bold;">${otp}</p>
    <p>This code will expire in 2 minutes.</p>
    <p>Sincerely,<br/>The EZ Budget & Nulla Pay Team</p>
  </div>
  `;

  try {
    const transporter = await getGmailTransporter();
    await transporter.sendMail({
      from: { name: "EZ Budget App", address: "support@nullapay.com" },
      to: toEmail,
      subject: "EZ Budget verification code",
      html,
    });
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (e) {
    console.log("email send error", e);

    try {
      if (body.type === "resendCodeForNewUser" && typeof body.email === "string") {
        const email = normalizeEmail(body.email);
        if (email) {
          await PendingUserModel.deleteOne({ email });
        }
      }

      if (body.type === "resendCodeForEmailChange") {
        const userInfo = await getUserInfo();
        if (userInfo) {
          await PendingEmailChangeModel.deleteOne({ oldEmail: userInfo.userEmail });
        }
      }
    } catch {}
    return NextResponse.json(
      {
        status: "error",
        message: "There was an error sending the code. Please try again or contact support@nullapay.com.",
      },
      { status: 500 }
    );
  }
}
