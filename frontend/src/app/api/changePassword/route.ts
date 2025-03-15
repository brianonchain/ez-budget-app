import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export const POST = async (request: Request) => {
  console.log("entered /api/changePassword");
  const { oldPassword, newPassword } = await request.json();

  // get jwtToken and verify
  const cookieStore = await cookies();
  const jwtToken = cookieStore.get("jwtToken")?.value;
  if (jwtToken) {
    try {
      var { email } = jwt.verify(jwtToken, process.env.JWT_SECRET!) as any; // will throw if cannot decrypt
    } catch (e) {
      cookieStore.delete("jwtToken");
      return NextResponse.redirect(new URL("/login", request.url)); // unauthorized => delete and redirect
    }
  } else {
    return NextResponse.redirect(new URL("/login", request.url)); // redundant, as middleware should have gauranteed token exists
  }

  // confirm password
  try {
    await dbConnect();
    var doc = await UserModel.findOne({ "settings.email": email }, { hashedPassword: 1 });
    if (doc) {
      const isPasswordCorrect = await bcrypt.compare(oldPassword, doc.hashedPassword);
      if (isPasswordCorrect) {
        // set new token
        const jwtToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: "2d" });
        cookieStore.set("jwtToken", jwtToken);

        const hashedPassword = await bcrypt.hash(newPassword, 10); // hash new password

        await UserModel.findOneAndUpdate({ "settings.email": email }, { $set: { hashedPassword: hashedPassword } }); // update new password
        return Response.json("saved");
      } else {
        return NextResponse.json("unauthorized");
      }
    } else {
      return NextResponse.json("no user"); // logout
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json("error");
  }
};
