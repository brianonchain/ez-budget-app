import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";

export const POST = async (request: Request) => {
  console.log("/api/changePassword");
  const { oldPassword, newPassword } = await request.json();

  const session = await getServerSession();
  const email = session?.user?.email;
  if (!email) return NextResponse.redirect(new URL("/login", request.url)); // TODO: delete session?

  try {
    await dbConnect();
    var doc = await UserModel.findOne({ "settings.email": email }, { hashedPassword: 1 });
    if (doc) {
      const isPasswordCorrect = await bcrypt.compare(oldPassword, doc.hashedPassword);
      if (isPasswordCorrect) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await UserModel.findOneAndUpdate({ "settings.email": email }, { $set: { hashedPassword: hashedPassword } });
        return Response.json({ status: "success" });
      } else {
        return NextResponse.json({ status: "error", message: "Old password is incorrect." });
      }
    } else {
      return NextResponse.json({ status: "error", message: "No matching user" });
    }
  } catch (e) {
    return NextResponse.json({ status: "error", message: "An unknown error occurred. We apologize for the inconvenience." });
  }
};
