import dbConnect from "@/db/dbConnect";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import UserModel from "@/db/UserModel";
import MembershipModel from "@/db/MembershipModel";
import ItemModel from "@/db/ItemModel";
import WorkspaceModel from "@/db/WorkspaceModel";
import { getUserInfo } from "@/utils/serverFunctions";

const PAGE_SIZE = 40;

export async function GET(request: Request) {
  // get and validate user
  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId, userEmail } = userInfo;

  // get and validate page
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page"));
  if (!Number.isInteger(page) || page < 0) return NextResponse.json({ status: "error", message: "Invalid page" }, { status: 400 });

  // calling User/Membership for every page fetch is OK (user will rarely fetch 2nd page)
  // calling User/Membership in separate query, then doing page fetch will result in slower first load (priority is fast first load)
  try {
    await dbConnect();
    // 1) get activeWorkspaceId from user
    const user = await UserModel.findById(userId).select("activeWorkspaceId").lean<{ activeWorkspaceId: Types.ObjectId | null } | null>();
    if (!user) return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });
    // 2) check if active workspace exists and if user is member; if either is false, pick the next available workspace
    let activeWorkspaceId = user.activeWorkspaceId;
    if (activeWorkspaceId) {
      const hasAccess = await MembershipModel.exists({ userId, workspaceId: activeWorkspaceId });
      if (!hasAccess) activeWorkspaceId = null;
    }
    if (!activeWorkspaceId) {
      const nextMembership = await MembershipModel.findOne({ userId })
        .select("workspaceId")
        .sort({ createdAt: 1 })
        .lean<{ workspaceId: Types.ObjectId } | null>();
      if (!nextMembership) return NextResponse.json({ status: "error", message: "No workspace membership" }, { status: 404 });
      activeWorkspaceId = nextMembership.workspaceId;
      await UserModel.updateOne({ _id: userId }, { $set: { activeWorkspaceId } });
    }
    // 3) load items (fetch PAGE_SIZE + 1 to determine hasMore) and default currency
    const items = await ItemModel.find({ workspaceId: activeWorkspaceId })
      .select("date cost currency description category subcategory tag createdBy")
      .sort({ date: -1, createdAt: -1 })
      .skip(page * PAGE_SIZE)
      .limit(PAGE_SIZE + 1) // trick to check if more items exist
      .populate({ path: "createdBy", select: "_id email" })
      .lean();
    const hasMore = items.length > PAGE_SIZE;
    if (hasMore) items.pop(); // remove the extra item
    return NextResponse.json({ status: "success", data: { items, hasMore } }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
}
