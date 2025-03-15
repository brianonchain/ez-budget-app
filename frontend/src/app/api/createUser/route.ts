import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const POST = async (request: NextRequest) => {
  console.log("/api/createUser");
  const { email, password } = await request.json();

  const cookieStore = await cookies();
  await dbConnect();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const doc = await UserModel.findOne({ "settings.email": email });
    if (doc) {
      return NextResponse.json("Email already exists");
    } else {
      // create user in mongodb
      await UserModel.create({
        hashedPassword: hashedPassword,
        "settings.email": email,
        "settings.currency": "",
        "settings.category": { none: ["none"] },
        "settings.tags": ["none"],
        items: [],
      });
      // issue jwtToken
      const jwtToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: "2d" });
      cookieStore.set("jwtToken", jwtToken);
      return NextResponse.json("success");
    }
  } catch (e) {
    console.log(e);
  }
  return NextResponse.json("error");
};
