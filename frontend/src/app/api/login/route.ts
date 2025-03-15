import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export const POST = async (request: Request) => {
  console.log("entered /api/login");
  const { email, password } = await request.json();

  const cookieStore = await cookies();

  try {
    await dbConnect();
    var doc = await UserModel.findOne({ "settings.email": email }, { hashedPassword: 1 });
    if (doc) {
      const isPasswordCorrect = await bcrypt.compare(password, doc.hashedPassword);
      if (isPasswordCorrect) {
        const jwtToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: "2d" });
        cookieStore.set("jwtToken", jwtToken);
        return NextResponse.json("success");
      } else {
        return NextResponse.json("unauthorized");
      }
    } else {
      return NextResponse.json("no user");
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json("error");
  }
};
