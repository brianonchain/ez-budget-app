import { NextResponse } from "next/server";
// db
import dbConnect from "@/db/dbConnect";
import { Types } from "mongoose";
import UserModel from "@/db/UserModel";
import MembershipModel from "@/db/MembershipModel";
import WorkspaceModel from "@/db/WorkspaceModel";
import PendingWorkspaceInviteModel from "@/db/PendingWorkspaceInviteModel";
// utils
import { MonthlyBudget, Role, Workspace } from "@/utils/types";
import { getUserInfo } from "@/utils/serverFunctions";
import { getMonthKey } from "@/utils/functions";

export async function GET() {
  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId, userEmail } = userInfo;

  try {
    await dbConnect();
    // 1) get user activeWorkspaceId
    const user = await UserModel.findById(userId).select("activeWorkspaceId").lean<{ activeWorkspaceId: Types.ObjectId | null } | null>();
    if (!user) return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });

    // 2) get memberships for workspace selector
    const memberships = await MembershipModel.find({ userId })
      .select("workspaceId role createdAt")
      .sort({ createdAt: 1 })
      .populate({ path: "workspaceId", select: "name ownerId ownerEmail" })
      .lean();

    const workspaceOptions = memberships.map((i) => ({
      _id: i.workspaceId._id.toString(),
      name: i.workspaceId.name,
      ownerId: i.workspaceId.ownerId.toString(),
      ownerEmail: i.workspaceId.ownerEmail,
      role: i.role,
    }));

    // 3) check activeWorkspace exists; if not, choose the first membership
    // can happen if another user deletes a shared workspace
    let activeWorkspaceId = user.activeWorkspaceId;
    if (!activeWorkspaceId) {
      if (memberships.length === 0) return NextResponse.json({ status: "error", message: "No workspace membership" }, { status: 404 });
      activeWorkspaceId = memberships[0].workspaceId._id;
      await UserModel.updateOne({ _id: userId }, { $set: { activeWorkspaceId } });
    }

    // 4) verify user belongs to active workspace
    const activeMembership = memberships.find((i) => i.workspaceId._id.equals(activeWorkspaceId));
    if (!activeMembership) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });

    // 5) load workspace settings
    const workspace = await WorkspaceModel.findById(activeWorkspaceId)
      .select("name defaultCurrency monthlyBudgets categoryObjects tags ownerId")
      .lean<Workspace>(); // .lean() converts Map to plain object
    if (!workspace) return NextResponse.json({ status: "error", message: "Workspace not found" }, { status: 404 });

    // 6) inherit from previous month if missing
    const monthlyBudgets: Record<string, MonthlyBudget> = workspace.monthlyBudgets ?? {};
    const now = new Date();
    const currentKey = getMonthKey(now);
    if (!monthlyBudgets[currentKey]) {
      const prevKey = getMonthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const prev = monthlyBudgets[prevKey];
      const inherited: MonthlyBudget = prev ? { ...prev } : { amount: 0, currency: workspace.defaultCurrency };
      monthlyBudgets[currentKey] = inherited;
      await WorkspaceModel.updateOne({ _id: activeWorkspaceId }, { $set: { [`monthlyBudgets.${currentKey}`]: inherited } });
    }
    workspace.monthlyBudgets = monthlyBudgets;

    // 7) load shared users for active workspace TODO: do this when entering modal, may improve TTL
    const [sharedUsersRaw, pendingSharedUsersRaw] = await Promise.all([
      MembershipModel.find({ workspaceId: activeWorkspaceId, role: { $ne: "owner" } })
        .select("userId role")
        .populate({ path: "userId", select: "email" })
        .lean(),
      PendingWorkspaceInviteModel.find({ workspaceId: activeWorkspaceId, expiresAt: { $gt: new Date() } })
        .select("invitedEmail invitedRole expiresAt")
        .lean(),
    ]);
    const sharedUsers = sharedUsersRaw.map((i: any) => ({
      _id: i.userId._id,
      email: i.userId.email,
      role: i.role,
    }));
    const pendingSharedUsers = pendingSharedUsersRaw.map((i: any) => ({
      _id: i._id,
      invitedEmail: i.invitedEmail,
      invitedRole: i.invitedRole,
      expiresAt: i.expiresAt,
    }));

    return NextResponse.json(
      {
        status: "success",
        data: {
          workspace,
          role: activeMembership.role,
          workspaceOptions,
          sharedUsers,
          pendingSharedUsers,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
}
