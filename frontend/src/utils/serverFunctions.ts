import crypto from "crypto";
import { serverEnv } from "@/utils/serverEnv";

export function hashOtp(otp: string) {
  return crypto.createHmac("sha256", serverEnv.OTP_HMAC_SECRET).update(otp).digest("base64url");
}

const nodemailer = require("nodemailer"); // nodemailer does not suppot es6
let transporter: any = null; // ← cache here
export async function getGmailTransporter() {
  if (transporter) return transporter; // ← reuse if exists
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "support@nullapay.com",
      clientId: serverEnv.GMAIL_CLIENT_ID,
      clientSecret: serverEnv.GMAIL_CLIENT_SECRET,
      refreshToken: serverEnv.GMAIL_REFRESH_TOKEN,
    },
  });

  return transporter;
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { Types } from "mongoose";

export async function getUserInfo() {
  const session = await getServerSession(authOptions);
  const userId = session?.userId;
  const userEmail = session?.user?.email;

  if (!userId || !Types.ObjectId.isValid(userId) || !userEmail) return null;

  return { userId: new Types.ObjectId(userId), userEmail };
}
