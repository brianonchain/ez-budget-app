import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

export const POST = async (request: Request) => {
  console.log("entered /api/mutateSettings");
  const { changes } = await request.json();

  const session = await getServerSession();
  const email = session?.user?.email;
  if (!email) return NextResponse.redirect(new URL("/login", request.url)); // TODO: delete session?

  // update db
  try {
    await dbConnect();
    await UserModel.findOneAndUpdate({ "settings.email": email }, { $set: changes });
    return Response.json("saved");
  } catch (e) {
    return Response.json("error");
  }
};
