import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";

import dbConnect from "@/db/dbConnect";
import { authOptions } from "@/utils/authOptions";
import { hashOtp } from "@/utils/serverFunctions";

import PendingWorkspaceInviteModel from "@/db/PendingWorkspaceInviteModel";
import MembershipModel from "@/db/MembershipModel";
import UserModel from "@/db/UserModel";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { token?: string } | null;

  if (!body || typeof body.token !== "string" || !body.token) {
    return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const userIdString = (session as any)?.userId as string | undefined;
  const sessionEmail = session?.user?.email?.toLowerCase().trim();

  if (!userIdString || !Types.ObjectId.isValid(userIdString) || !sessionEmail) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const userId = new Types.ObjectId(userIdString);

  try {
    await dbConnect();

    const tokenHash = hashOtp(body.token);

    const invite = await PendingWorkspaceInviteModel.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    }).lean<{
      _id: Types.ObjectId;
      workspaceId: Types.ObjectId;
      invitedEmail: string;
      invitedRole: "editor" | "viewer";
    } | null>();

    if (!invite) {
      return NextResponse.json({ status: "error", message: "Invite not found or expired." }, { status: 404 });
    }

    if (invite.invitedEmail !== sessionEmail) {
      return NextResponse.json({ status: "error", message: "This invite belongs to another email address." }, { status: 403 });
    }

    await MembershipModel.updateOne(
      { userId, workspaceId: invite.workspaceId },
      {
        $setOnInsert: {
          userId,
          workspaceId: invite.workspaceId,
          role: invite.invitedRole,
        },
      },
      { upsert: true }
    );

    await UserModel.updateOne({ _id: userId }, { $set: { activeWorkspaceId: invite.workspaceId } });

    await PendingWorkspaceInviteModel.deleteOne({ _id: invite._id });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "error", message: "Server error." }, { status: 500 });
  }
}
