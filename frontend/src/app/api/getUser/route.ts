import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

export const GET = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const doc = await UserModel.findOne({ "settings.email": session.user.email }, { settings: 1, items: 1 }).lean();
    if (doc) {
      return NextResponse.json({ status: "success", data: doc }, { status: 200 });
    } else {
      return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });
    }
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
};
