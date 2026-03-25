import { NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import { Types } from "mongoose";
import MembershipModel from "@/db/MembershipModel";
import PendingWorkspaceInviteModel from "@/db/PendingWorkspaceInviteModel";
import { getUserInfo } from "@/utils/serverFunctions";

export async function GET(request: Request) {
  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId } = userInfo;

  const { searchParams } = new URL(request.url);
  const rawWorkspaceId = searchParams.get("workspaceId");
  if (!rawWorkspaceId || !Types.ObjectId.isValid(rawWorkspaceId)) {
    return NextResponse.json({ status: "error", message: "Invalid workspaceId" }, { status: 400 });
  }
  const workspaceId = new Types.ObjectId(rawWorkspaceId);

  try {
    await dbConnect();

    const member = await MembershipModel.exists({ userId, workspaceId });
    if (!member) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });

    const [sharedUsersRaw, pendingSharedUsersRaw] = await Promise.all([
      MembershipModel.find({ workspaceId, role: { $ne: "owner" } })
        .select("userId role")
        .populate({ path: "userId", select: "email" })
        .lean(),
      PendingWorkspaceInviteModel.find({ workspaceId, expiresAt: { $gt: new Date() } })
        .select("invitedEmail invitedRole expiresAt")
        .lean(),
    ]);

    type SharedRow = { userId: { _id: Types.ObjectId; email: string }; role: "editor" | "viewer" };
    const sharedUsers = (sharedUsersRaw as unknown as SharedRow[]).map((i) => ({
      _id: i.userId._id.toString(),
      email: i.userId.email,
      role: i.role,
    }));

    type PendingRow = { _id: Types.ObjectId; invitedEmail: string; invitedRole: string; expiresAt: Date };
    const pendingSharedUsers = (pendingSharedUsersRaw as unknown as PendingRow[]).map((i) => ({
      _id: i._id.toString(),
      invitedEmail: i.invitedEmail,
      invitedRole: i.invitedRole as "editor" | "viewer",
      expiresAt: (i.expiresAt instanceof Date ? i.expiresAt : new Date(i.expiresAt as string)).toISOString(),
    }));

    return NextResponse.json(
      {
        status: "success",
        data: { sharedUsers, pendingSharedUsers },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
}
