import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";

export const GET = async (request: NextRequest) => {
  console.log("entered /api/getUser");

  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.redirect(new URL("/login", request.url)); // TODO: delete session?

  try {
    await dbConnect();
    const doc = await UserModel.findOne({ "settings.email": session.user.email }, { settings: 1, items: 1 });
    if (doc) {
      return NextResponse.json({ status: "success", data: doc });
    } else {
      return NextResponse.redirect(new URL("/login", request.url)); // TODO: delete session?
    }
  } catch (e) {
    return NextResponse.json("error"); // database is down?
  }
};
