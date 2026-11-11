import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import bcrypt from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";
import { checkPassword } from "@/utils/functions";
import { getUserInfo } from "@/utils/serverFunctions";

// TODO: should add a rate limiter
export const POST = async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  // security gate
  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId, userEmail } = userInfo;

  // check type
  if (!body || typeof body.oldPassword !== "string" || typeof body.newPassword !== "string") {
    return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
  }
  const oldPassword = body.oldPassword;
  const newPassword = body.newPassword;
  // exists
  if (!oldPassword.trim() || !newPassword.trim()) {
    return NextResponse.json({ status: "error", message: "Missing password fields." }, { status: 400 });
  }
  // is password valid
  if (!checkPassword(newPassword)) return NextResponse.json({ status: "error", message: "Invalid password." }, { status: 400 });
  // is different from old password
  if (oldPassword === newPassword)
    return NextResponse.json({ status: "error", message: "New password must be different from the old password." }, { status: 400 });

  // mutate
  try {
    await dbConnect();
    const user = await UserModel.findById(userId, { hashedPassword: 1 });
    if (!user) return NextResponse.json({ status: "error", message: "No matching user" }, { status: 404 });
    // for users who created account with social login
    if (!user.hashedPassword)
      return NextResponse.json({ status: "error", message: "Password login is not enabled for this account." }, { status: 400 });

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.hashedPassword);
    if (!isPasswordCorrect)
      return NextResponse.json({ status: "error", message: "Old password is incorrect. Please try again." }, { status: 400 });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.updateOne({ _id: userId }, { $set: { hashedPassword } });
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "error", message: "Server error. Please try again." }, { status: 500 });
  }
};
