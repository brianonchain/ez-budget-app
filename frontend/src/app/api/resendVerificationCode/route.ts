import { NextResponse } from "next/server";
// db
import PendingUserModel from "@/db/PendingUserModel";
import UserModel from "@/db/UserModel";
import dbConnect from "@/db/dbConnect";
// utils
import { generateOtp, normalizeEmail } from "@/utils/functions";
import { hashOtp, getGmailTransporter } from "@/utils/serverFunctions";

export async function POST(req: Request) {
  // parse body safely
  const { email } = (await req.json().catch(() => ({}))) as { email?: unknown };
  const _email = normalizeEmail(String(email || ""));

  if (!_email) {
    return NextResponse.json({ status: "error", message: "Missing email." }, { status: 400 });
  }
  if (_email.includes(" ")) {
    return NextResponse.json({ status: "error", message: "Invalid email." }, { status: 400 });
  }

  // DB: validate resend is allowed + update OTP
  let otp: string;
  try {
    await dbConnect();
    // If user already exists, don't resend code
    const user = await UserModel.findOne({ "settings.email": _email }).lean();
    if (user) {
      return NextResponse.json({ status: "error", message: "Account already exists." }, { status: 409 });
    }
    // If PendingUser is missing or docExpiredAt is in the past, then return error
    const pendingUser = await PendingUserModel.findOne({ email: _email, docExpiresAt: { $gt: new Date() } });
    if (!pendingUser) {
      return NextResponse.json({ status: "error", message: "Verification session expired. Please sign up again." }, { status: 404 });
    }

    // Generate new OTP + update expiry windows
    otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await PendingUserModel.updateOne(
      { email: _email },
      {
        $set: {
          hashedOtp,
          otpExpiresAt: new Date(Date.now() + 2 * 60 * 1000),
          docExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      }
    );
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }

  // email HTML
  const html = `
  <div>
    <p>Thank you for using EZ Budget!</p>
    <p>Your verification code is:</p>
    <p style="font-size:20px;font-weight:bold;">${otp}</p>
    <p>This code will expire in 2 minutes.</p>
    <p>Sincerely,<br/>The EZ Budget & Nulla Pay Team</p>
  </div>
`;

  // SEND EMAIL
  try {
    const transporter = await getGmailTransporter();
    await transporter.sendMail({
      from: { name: "EZ Budget App", address: "support@nullapay.com" },
      to: _email,
      subject: "EZ Budget verification code",
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
        message: "There was an error sending the code to your email. Please try registering again or notify support@nullapay.com.",
      },
      { status: 500 }
    );
  }
}
