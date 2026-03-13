import dbConnect from "@/db/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import UserModel from "@/db/UserModel";
import MembershipModel from "@/db/MembershipModel";
import ItemModel from "@/db/ItemModel";
import WorkspaceModel from "@/db/WorkspaceModel";
import { getUserInfo } from "@/utils/serverFunctions";

export async function GET(req: NextRequest) {
  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId } = userInfo;

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "month"; // "week" | "month" | "year"
  const dateParam = searchParams.get("date") || new Date().toISOString();
  const anchorDate = new Date(dateParam);

  if (!["week", "month", "year"].includes(period)) {
    return NextResponse.json({ status: "error", message: "Invalid period" }, { status: 400 });
  }

  try {
    await dbConnect();

    const user = await UserModel.findById(userId).select("activeWorkspaceId").lean<{ activeWorkspaceId: Types.ObjectId | null } | null>();
    if (!user) return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });

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
    }

    const membership = await MembershipModel.exists({ userId, workspaceId: activeWorkspaceId });
    if (!membership) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });

    const workspace = await WorkspaceModel.findById(activeWorkspaceId).select("defaultCurrency").lean<{ defaultCurrency: string } | null>();
    if (!workspace) return NextResponse.json({ status: "error", message: "Workspace not found" }, { status: 404 });

    let startDate: Date;
    let endDate: Date;

    if (period === "week") {
      const day = anchorDate.getDay();
      const diff = day === 0 ? 6 : day - 1; // Monday=0 offset
      startDate = new Date(anchorDate);
      startDate.setDate(anchorDate.getDate() - diff);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
    } else if (period === "month") {
      startDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
      endDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1);
    } else {
      startDate = new Date(anchorDate.getFullYear(), 0, 1);
      endDate = new Date(anchorDate.getFullYear() + 1, 0, 1);
    }

    const items = await ItemModel.find({
      workspaceId: activeWorkspaceId,
      date: { $gte: startDate, $lt: endDate },
    })
      .select("date cost currency category")
      .lean<{ date: Date; cost: number; currency: string; category: string }[]>();

    return NextResponse.json(
      {
        status: "success",
        data: {
          items,
          defaultCurrency: workspace.defaultCurrency,
          period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
}
