import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

export const POST = async (request: Request) => {
  console.log("entered /api/mutateSettings");
  const { changes } = await request.json();

  const session = await getServerSession();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });

  // update db
  try {
    await dbConnect();
    await UserModel.findOneAndUpdate({ "settings.email": email }, { $set: changes });
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
};
