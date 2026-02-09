import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import bcrypt from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

export const POST = async (request: NextRequest) => {
  const { oldPassword, newPassword } = await request.json();

  // TODO: should add a rate limiter

  // only logged in users can access this endpoint
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const user = await UserModel.findOne({ "settings.email": email }, { hashedPassword: 1 });
    if (!user) return NextResponse.json({ status: "error", message: "No matching user" }, { status: 404 });

    // for users who created account with social login
    if (!user.hashedPassword) {
      return NextResponse.json({ status: "error", message: "Password login is not enabled for this account." }, { status: 400 });
    }

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.hashedPassword);
    if (!isPasswordCorrect)
      return NextResponse.json({ status: "error", message: "Old password is incorrect. Please try again." }, { status: 400 });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.findOneAndUpdate({ "settings.email": email }, { $set: { hashedPassword: hashedPassword } });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Server error. Please try again." }, { status: 500 });
  }
};
