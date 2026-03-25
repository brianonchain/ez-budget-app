import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import MembershipModel from "@/db/MembershipModel";
import SettingsShell from "./SettingsShell";
import SettingsClient from "./SettingsClient";

async function resolveActiveWorkspaceId(userId: string): Promise<string | null> {
  await dbConnect();
  const oid = new Types.ObjectId(userId);
  const user = await UserModel.findById(oid).select("activeWorkspaceId").lean<{ activeWorkspaceId: Types.ObjectId | null } | null>();
  if (!user) return null;
  let wid = user.activeWorkspaceId;
  if (wid) {
    const member = await MembershipModel.exists({ userId: oid, workspaceId: wid });
    if (!member) wid = null;
  }
  if (!wid) {
    const m = await MembershipModel.findOne({ userId: oid })
      .sort({ createdAt: 1 })
      .select("workspaceId")
      .lean<{ workspaceId: Types.ObjectId } | null>();
    wid = m?.workspaceId ?? null;
  }
  return wid?.toString() ?? null;
}

export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session || !session.provider || !session.user?.email || !session.userId) redirect("/login");

  const activeWorkspaceId = await resolveActiveWorkspaceId(session.userId);

  return (
    <SettingsShell>
      <SettingsClient
        provider={session.provider}
        email={session.user.email}
        userId={session.userId}
        activeWorkspaceId={activeWorkspaceId}
      />
    </SettingsShell>
  );
}
