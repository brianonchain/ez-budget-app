import crypto from "crypto";

const OTP_HMAC_SECRET = process.env.OTP_HMAC_SECRET;
if (!OTP_HMAC_SECRET) throw new Error("Missing OTP_HMAC_SECRET");

export function hashOtp(otp: string) {
  return crypto.createHmac("sha256", OTP_HMAC_SECRET!).update(otp).digest("base64url");
}
