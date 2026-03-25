import { NextResponse } from "next/server";
// db
import dbConnect from "@/db/dbConnect";
import { Types } from "mongoose";
import MembershipModel from "@/db/MembershipModel";
import WorkspaceModel from "@/db/WorkspaceModel";
// utils
import { Workspace } from "@/utils/types";
import { getUserInfo } from "@/utils/serverFunctions";

export async function GET(request: Request) {
  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId } = userInfo;

  const { searchParams } = new URL(request.url);
  const rawWorkspaceId = searchParams.get("activeWorkspaceId");
  if (!rawWorkspaceId || !Types.ObjectId.isValid(rawWorkspaceId)) {
    return NextResponse.json({ status: "error", message: "Invalid activeWorkspaceId" }, { status: 400 });
  }
  const activeWorkspaceId = new Types.ObjectId(rawWorkspaceId);

  try {
    await dbConnect();
    const [memberships, workspace] = await Promise.all([
      MembershipModel.find({ userId })
        .select("workspaceId role createdAt")
        .sort({ createdAt: 1 })
        .populate({ path: "workspaceId", select: "name ownerId ownerEmail" })
        .lean(),
      WorkspaceModel.findById(activeWorkspaceId)
        .select("name ownerId ownerEmail defaultCurrency categoryObjects tags discretionaryBudget")
        .lean<Workspace | null>(),
    ]);

    const workspaceOptions = memberships.map((i) => ({
      _id: i.workspaceId._id.toString(),
      name: i.workspaceId.name,
      ownerId: i.workspaceId.ownerId.toString(),
      ownerEmail: i.workspaceId.ownerEmail,
      role: i.role,
    }));

    // if no memberships, then error
    if (memberships.length === 0) return NextResponse.json({ status: "error", message: "No workspace membership" }, { status: 404 });

    // if user is member of active workspace
    const activeMembership = memberships.find((i) => i.workspaceId._id.equals(activeWorkspaceId));
    if (!activeMembership) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });

    if (!workspace) return NextResponse.json({ status: "error", message: "Workspace not found" }, { status: 404 });

    // 4) load shared users for active workspace TODO: do this when entering modal, may improve TTL
    // const [sharedUsersRaw, pendingSharedUsersRaw] = await Promise.all([
    //   MembershipModel.find({ workspaceId: activeWorkspaceId, role: { $ne: "owner" } })
    //     .select("userId role")
    //     .populate({ path: "userId", select: "email" })
    //     .lean(),
    //   PendingWorkspaceInviteModel.find({ workspaceId: activeWorkspaceId, expiresAt: { $gt: new Date() } })
    //     .select("invitedEmail invitedRole expiresAt")
    //     .lean(),
    // ]);
    // const sharedUsers = sharedUsersRaw.map((i: any) => ({
    //   _id: i.userId._id,
    //   email: i.userId.email,
    //   role: i.role,
    // }));
    // const pendingSharedUsers = pendingSharedUsersRaw.map((i: any) => ({
    //   _id: i._id,
    //   invitedEmail: i.invitedEmail,
    //   invitedRole: i.invitedRole,
    //   expiresAt: i.expiresAt,
    // }));

    return NextResponse.json(
      {
        status: "success",
        data: {
          workspace,
          role: activeMembership.role,
          workspaceOptions,
          // sharedUsers,
          // pendingSharedUsers,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
}
