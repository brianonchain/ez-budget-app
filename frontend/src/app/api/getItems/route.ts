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
  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId, userEmail } = userInfo;

  const { searchParams } = new URL(request.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);

  try {
    await dbConnect();
    // 1) get activeWorkspaceId from user
    const user = await UserModel.findById(userId).select("activeWorkspaceId").lean<{ activeWorkspaceId: Types.ObjectId | null } | null>();
    if (!user) return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });
    // 2) if missing, or no longer a valid membership, pick the next available workspace
    let activeWorkspaceId = user.activeWorkspaceId;
    const hasAccess = activeWorkspaceId ? await MembershipModel.exists({ userId, workspaceId: activeWorkspaceId }) : null;
    if (!activeWorkspaceId || !hasAccess) {
      const nextMembership = await MembershipModel.findOne({ userId })
        .select("workspaceId")
        .sort({ createdAt: 1 })
        .lean<{ workspaceId: Types.ObjectId } | null>();
      if (!nextMembership) {
        return NextResponse.json({ status: "error", message: "No workspace membership" }, { status: 404 });
      }
      activeWorkspaceId = nextMembership.workspaceId;
      await UserModel.updateOne({ _id: userId }, { $set: { activeWorkspaceId } });
    }
    // 3) security gate: user must belong to active workspace
    const membership = await MembershipModel.exists({ userId, workspaceId: activeWorkspaceId });
    if (!membership) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
    // 4) load items (fetch PAGE_SIZE + 1 to determine hasMore) and default currency
    const [items, workspace] = await Promise.all([
      ItemModel.find({ workspaceId: activeWorkspaceId })
        .select("date cost currency description category subcategory tag createdBy")
        .sort({ date: -1, createdAt: -1 })
        .skip(page * PAGE_SIZE)
        .limit(PAGE_SIZE + 1)
        .populate({ path: "createdBy", select: "_id email" })
        .lean(),
      WorkspaceModel.findById(activeWorkspaceId).select("defaultCurrency").lean<{ defaultCurrency: string } | null>(),
    ]);
    if (!workspace) return NextResponse.json({ status: "error", message: "Workspace not found" }, { status: 404 });
    const hasMore = items.length > PAGE_SIZE;
    if (hasMore) items.pop();
    return NextResponse.json({ status: "success", data: { items, defaultCurrency: workspace.defaultCurrency, hasMore } }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
}
