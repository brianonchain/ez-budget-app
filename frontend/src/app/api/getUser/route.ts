import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const POST = async (request: NextRequest) => {
  console.log("entered /api/getUser");
  const {} = await request.json();

  // get token and decrypt
  const cookieStore = await cookies();
  const jwtToken = cookieStore.get("jwtToken")?.value;
  if (jwtToken) {
    try {
      var { email } = jwt.verify(jwtToken, process.env.JWT_SECRET!) as any; // throws error if cannot decrypt
    } catch (e) {
      cookieStore.delete("jwtToken");
      return NextResponse.redirect(new URL("/login", request.url)); // delete token and redirect since unauthorized token
    }
  } else {
    return NextResponse.redirect(new URL("/login", request.url)); // redundant, as middleware should have gauranteed token exists
  }

  try {
    await dbConnect();
    const doc = await UserModel.findOne({ "settings.email": email }, { settings: 1, items: 1 });
    if (doc) {
      return NextResponse.json({ status: "success", data: doc });
    } else {
      cookieStore.delete("jwtToken");
      return NextResponse.redirect(new URL("/login", request.url)); // delete token and redirect since no user
    }
  } catch (e) {
    return NextResponse.json("error"); // database is down?
  }
};
