import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import jwt from "jsonwebtoken";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export const POST = async (request: Request) => {
  console.log("entered /api/mutateItems");
  const { item } = await request.json();

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

  // save to db; if findOneAndUpdate fails, will throw error
  try {
    await dbConnect();
    if (item._id) {
      await UserModel.findOneAndUpdate({ "settings.email": email, "items._id": item._id }, { $set: { "items.$": item } }); // if old item, then update
    } else {
      await UserModel.findOneAndUpdate({ "settings.email": email }, { $push: { items: item } }); // if new item, then push
    }
    return NextResponse.json("saved");
  } catch (error) {
    return NextResponse.json("not saved");
  }
};
