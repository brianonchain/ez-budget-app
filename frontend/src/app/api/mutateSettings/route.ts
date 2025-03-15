import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import jwt from "jsonwebtoken";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export const POST = async (request: Request) => {
  console.log("entered /api/mutateSettings");
  const { changes } = await request.json();

  // get jwtToken and verify
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

  // update db
  try {
    await dbConnect();
    await UserModel.findOneAndUpdate({ "settings.email": email }, { $set: changes });
    console.log("changes saved");
    return Response.json("saved");
  } catch (e) {
    console.log("changes not saved");
    return Response.json("error");
  }
};
