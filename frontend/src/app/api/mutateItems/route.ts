import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

export const POST = async (request: Request) => {
  console.log("entered /api/mutateItems");
  const { item } = await request.json();

  const session = await getServerSession();
  const email = session?.user?.email;
  if (!email) return NextResponse.redirect(new URL("/login", request.url)); // TODO: delete session?

  // save to db
  // if findOneAndUpdate fails, then error will be thrown => caught => respond with "not saved"
  try {
    await dbConnect();
    if (item._id) {
      await UserModel.findOneAndUpdate({ "settings.email": email, "items._id": item._id }, { $set: { "items.$": item } }); // item._id => old item => update
    } else {
      await UserModel.findOneAndUpdate({ "settings.email": email }, { $push: { items: item } }); // if new item, then push
    }
    return NextResponse.json("saved");
  } catch (error) {
    return NextResponse.json("error");
  }
};
