import { NextResponse } from "next/server";
// next-auth
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import crypto from "crypto";
// db
import dbConnect from "@/db/dbConnect";
import { Types } from "mongoose";
import MembershipModel from "@/db/MembershipModel";
import WorkspaceModel from "@/db/WorkspaceModel";
import ItemModel from "@/db/ItemModel";
import UserModel from "@/db/UserModel";
import PendingWorkspaceInviteModel from "@/db/PendingWorkspaceInviteModel";
// utils
import { CURRENCIES } from "@/utils/constants";
import { MutateUserPayload, Role } from "@/utils/types";
import { normalizeEmail } from "@/utils/functions";
import { getGmailTransporter, hashOtp } from "@/utils/serverFunctions";
import { publicEnv } from "@/utils/publicEnv";
import { getUserInfo } from "@/utils/serverFunctions";
import { isObjectIdString } from "@/utils/typeGuards";

export async function isOwner(userId: Types.ObjectId, workspaceId: Types.ObjectId): Promise<boolean> {
  const exists = await MembershipModel.exists({ userId, workspaceId, role: "owner" }); // returns { _id: ... } | null so need !! to convert to boolean
  return !!exists;
}

export const POST = async (request: Request) => {
  const payload = (await request.json().catch(() => null)) as MutateUserPayload | null;
  if (!payload || !payload.type) return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
  // authentication
  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId, userEmail } = userInfo;

  try {
    await dbConnect();
    switch (payload.type) {
      case "deleteAccount": {
        // type check
        if (!isObjectIdString(payload.userId)) return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // security: must be owner
        if (!userId.equals(payload.userId)) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
        // delete
        const ownedMemberships = await MembershipModel.find({ userId, role: "owner" }).select("workspaceId").lean();
        const ownedWorkspaceIds = ownedMemberships.map((i) => i.workspaceId);
        if (ownedWorkspaceIds.length > 0) {
          await Promise.all([
            ItemModel.deleteMany({ workspaceId: { $in: ownedWorkspaceIds } }), // keep user's items in non-owned workspaces
            MembershipModel.deleteMany({ userId }), // remove owner and non-owner memberships
            PendingWorkspaceInviteModel.deleteMany({ $or: [{ invitedEmail: userEmail }, { invitedByUserId: userId }] }), // remove pending invites sent to or sent by this user
            WorkspaceModel.deleteMany({ _id: { $in: ownedWorkspaceIds } }), // delete owned workspaces
            UserModel.updateMany({ activeWorkspaceId: { $in: ownedWorkspaceIds } }, { $unset: { activeWorkspaceId: "" } }), // unset activeWorkspaceId if needed
          ]);
        }
        // delete the user document
        const result = await UserModel.deleteOne({ _id: userId });
        if (result.deletedCount === 0) return NextResponse.json({ status: "error", message: "User not found." }, { status: 404 });
        break;
      }

      case "setActiveWorkspace": {
        // type check
        if (!isObjectIdString(payload.workspaceId))
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // normalize
        const newWorkspaceId = new Types.ObjectId(payload.workspaceId);
        // verify membership
        const exists = await MembershipModel.exists({ userId, workspaceId: newWorkspaceId });
        if (!exists) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
        // mutation
        await UserModel.updateOne({ _id: userId }, { $set: { activeWorkspaceId: newWorkspaceId } });
        break;
      }

      case "addWorkspace": {
        // type check
        if (typeof payload.name !== "string" || typeof payload.defaultCurrency !== "string")
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // normalize
        const name = payload.name.trim();
        const defaultCurrency = payload.defaultCurrency;
        // exists
        if (!name || !defaultCurrency) return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // supported currencies
        if (!CURRENCIES.includes(defaultCurrency))
          return NextResponse.json({ status: "error", message: "Currency not supported." }, { status: 400 });
        // create workspace
        const workspace = await WorkspaceModel.create({
          name,
          ownerId: userId,
          defaultCurrency,
          tags: ["none"],
          categoryObjects: [
            {
              category: "none",
              subcategories: ["none"],
            },
          ],
        });
        // create membership (owner)
        await MembershipModel.create({
          userId,
          workspaceId: workspace._id,
          role: "owner",
        });
        // set active workspace
        await UserModel.updateOne({ _id: userId }, { $set: { activeWorkspaceId: workspace._id } });
        break;
      }

      case "deleteWorkspace": {
        // type check
        if (!isObjectIdString(payload.workspaceId))
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // normalize
        const workspaceId = new Types.ObjectId(payload.workspaceId);
        // verify ownership
        if (!(await isOwner(userId, workspaceId))) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
        // must own at least one workspace after deletion
        const ownedWorkspaceCount = await MembershipModel.countDocuments({ userId, role: "owner" });
        if (ownedWorkspaceCount <= 1)
          return NextResponse.json({ status: "error", message: "You must own at least one workspace." }, { status: 400 });
        // delete
        await Promise.all([
          ItemModel.deleteMany({ workspaceId }), // delete items
          MembershipModel.deleteMany({ workspaceId }), // delete memberships
          UserModel.updateMany({ activeWorkspaceId: workspaceId }, { $unset: { activeWorkspaceId: "" } }), // remove activeWorkspaceId if needed
        ]);
        await WorkspaceModel.deleteOne({ _id: workspaceId }); // delete workspace
        break;
      }

      case "shareWorkspace": {
        // type check
        if (
          !isObjectIdString(payload.workspaceId) ||
          typeof payload.workspaceName !== "string" ||
          typeof payload.email !== "string" ||
          !["editor", "viewer"].includes(payload.role)
        ) {
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        }
        // normalize
        const workspaceId = new Types.ObjectId(payload.workspaceId);
        const invitedEmail = normalizeEmail(payload.email);
        const invitedRole = payload.role;
        const workspaceName = payload.workspaceName;
        // exists
        if (!invitedEmail || !workspaceName) return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // cannot invite self
        if (userEmail === invitedEmail) return NextResponse.json({ status: "error", message: "Cannot invite self." }, { status: 409 });
        // SECURITY: owner gate
        if (!(await isOwner(userId, workspaceId))) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
        // check if invitedEmail already a member
        const existingUser = await UserModel.findOne({ email: invitedEmail }).select("_id").lean<{ _id: Types.ObjectId } | null>();
        if (existingUser) {
          const existingMembership = await MembershipModel.exists({ userId: existingUser._id, workspaceId });
          if (existingMembership) return NextResponse.json({ status: "error", message: "That user already has access." }, { status: 409 });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = hashOtp(rawToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await PendingWorkspaceInviteModel.updateOne(
          { workspaceId, invitedEmail },
          { $set: { workspaceId, invitedEmail, invitedRole, invitedByUserId: userId, tokenHash, expiresAt } },
          { upsert: true }
        );

        const html = `
          <div>
            <p>You have been invited to join the workspace <strong>${workspaceName}</strong> by ${userEmail}.</p>
            <p>Role: <strong>${invitedRole}</strong></p>
            <p style="margin: 24px 0;">
              <a
                href="${publicEnv.NEXT_PUBLIC_BASE_URL}/invite?token=${rawToken}"
                style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;"
              >
                Accept Invite
              </a>
            </p>
            <p>If you do not have an account yet, you can sign up with this same email address first.</p>
            <p>This invite will expire in 7 days.</p>
          </div>
        `;

        try {
          const transporter = await getGmailTransporter();
          await transporter.sendMail({
            from: { name: "EZ Budget App", address: "support@nullapay.com" },
            to: invitedEmail,
            subject: `Invitation to join ${workspaceName}`,
            html,
          });
        } catch {
          await PendingWorkspaceInviteModel.deleteOne({ workspaceId, invitedEmail: invitedEmail });
          return NextResponse.json({ status: "error", message: "Failed to send invite email. Please try again." }, { status: 500 });
        }
        break;
      }

      case "deletePendingSharedUser": {
        // type check
        if (!isObjectIdString(payload.workspaceId) || typeof payload.invitedEmail !== "string") {
          return NextResponse.json({ status: "error", message: "Invalid payload type." }, { status: 400 });
        }
        // normalize
        const workspaceId = new Types.ObjectId(payload.workspaceId);
        const invitedEmail = normalizeEmail(payload.invitedEmail);
        // exists
        if (!invitedEmail) return NextResponse.json({ status: "error", message: "Invalid email." }, { status: 400 });
        // verify ownership
        if (!(await isOwner(userId, workspaceId))) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
        // delete pendingSharedUser
        const result = await PendingWorkspaceInviteModel.deleteOne({
          workspaceId,
          invitedEmail,
        });
        if (result.deletedCount === 0) return NextResponse.json({ status: "error", message: "Invite not found." }, { status: 404 });
        break;
      }

      case "deleteSharedUser": {
        // type check
        if (!isObjectIdString(payload.workspaceId) || !isObjectIdString(payload.sharedUserId)) {
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        }
        // normalize
        const workspaceId = new Types.ObjectId(payload.workspaceId);
        const sharedUserId = new Types.ObjectId(payload.sharedUserId);
        // verify ownership
        if (!(await isOwner(userId, workspaceId))) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
        // cannot remove self as owner
        if (sharedUserId.toString() === userId.toString()) {
          return NextResponse.json({ status: "error", message: "Owner cannot remove themselves." }, { status: 400 });
        }
        // delete membership, but never delete owner role
        const result = await MembershipModel.deleteOne({
          userId: sharedUserId,
          workspaceId,
          role: { $ne: "owner" },
        });
        if (result.deletedCount === 0) {
          return NextResponse.json({ status: "error", message: "Shared user not found." }, { status: 404 });
        }
        break;
      }

      case "updateSharedUser": {
        // type check
        if (
          !isObjectIdString(payload.workspaceId) ||
          !isObjectIdString(payload.sharedUserId) ||
          typeof payload.role !== "string" ||
          !["editor", "viewer"].includes(payload.role)
        ) {
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        }
        // normalize
        const workspaceId = new Types.ObjectId(payload.workspaceId);
        const sharedUserId = new Types.ObjectId(payload.sharedUserId);
        const role = payload.role as "editor" | "viewer";
        // verify ownership
        if (!(await isOwner(userId, workspaceId))) return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
        // cannot update self / owner through this endpoint
        if (sharedUserId.toString() === userId.toString()) {
          return NextResponse.json({ status: "error", message: "Cannot change owner role here." }, { status: 400 });
        }
        // update only non-owner memberships
        const result = await MembershipModel.updateOne({ userId: sharedUserId, workspaceId, role: { $ne: "owner" } }, { $set: { role } });
        if (result.matchedCount === 0) {
          return NextResponse.json({ status: "error", message: "Shared user not found." }, { status: 404 });
        }
        break;
      }

      default: {
        // const _exhaustiveCheck: never = payload.type; // check if every case is handled
        return NextResponse.json({ status: "error", message: "Invalid operation type." }, { status: 400 });
      }
    }
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (e) {
    console.log("error", e);
    return NextResponse.json({ status: "error", message: "User data failed to update. Please try again." }, { status: 500 });
  }
};
