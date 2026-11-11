import dbConnect from "@/db/dbConnect";
import { NextResponse } from "next/server";
import MembershipModel from "@/db/MembershipModel";
import ItemModel from "@/db/ItemModel";
import { Types } from "mongoose";
import { getUserInfo } from "@/utils/serverFunctions";

export async function GET(request: Request) {
  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId } = userInfo;

  // get search params
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const rawStart = searchParams.get("startDate");
  const rawEnd = searchParams.get("endDate");
  // validate params
  if (!workspaceId || !Types.ObjectId.isValid(workspaceId))
    return NextResponse.json({ status: "error", message: "Invalid workspaceId" }, { status: 400 });
  const startDate = new Date(rawStart ?? "");
  const endDate = new Date(rawEnd ?? "");
  if (!rawStart || !rawEnd || isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
    return NextResponse.json({ status: "error", message: "Invalid date range" }, { status: 400 });
  endDate.setUTCHours(23, 59, 59, 999);

  try {
    await dbConnect();
    const membership = await MembershipModel.exists({ userId, workspaceId });
    if (!membership) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });

    // decided to not return createdBy because it can be "null" if creator deleted their account
    const items = await ItemModel.find({ workspaceId, date: { $gte: startDate, $lte: endDate } })
      .select("date cost currency description category subcategory tag")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ status: "success", data: { items } }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
}
