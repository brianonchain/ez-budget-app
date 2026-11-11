import dbConnect from "@/db/dbConnect";
import { NextResponse } from "next/server";
import { MutateItemsPayload, Role } from "@/utils/types";
import { Types } from "mongoose";
import MembershipModel from "@/db/MembershipModel";
import ItemModel from "@/db/ItemModel";
import { getUserInfo } from "@/utils/serverFunctions";
import { isDraftItem, isObjectIdString } from "@/utils/typeGuards";
import PushSubscriptionModel from "@/db/PushSubscriptionModel";
import webpush from "web-push";
import { serverEnv } from "@/utils/serverEnv";
import { publicEnv } from "@/utils/publicEnv";

webpush.setVapidDetails(serverEnv.VAPID_SUBJECT, publicEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY, serverEnv.VAPID_PRIVATE_KEY);

export const POST = async (request: Request) => {
  const payload = (await request.json().catch(() => null)) as MutateItemsPayload | null;
  if (!payload || !payload.type) return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
  // authentication
  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId, userEmail } = userInfo;

  // validate workspaceId
  if (!isObjectIdString(payload.workspaceId)) return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
  const workspaceId = new Types.ObjectId(payload.workspaceId);

  try {
    await dbConnect();
    // security: verify membership
    const memberships = await MembershipModel.find({ workspaceId }).select("userId role").lean<{ userId: Types.ObjectId; role: Role }[]>();
    const actorMembership = memberships.find((i) => i.userId.toString() === userId.toString());
    if (!actorMembership || actorMembership.role === "viewer") {
      return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
    }
    // const membership = await MembershipModel.findOne({ userId, workspaceId }).select("role").lean<{ role: Role } | null>();
    // if (!membership || membership.role === "viewer") {
    //   return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
    // }

    switch (payload.type) {
      case "upsert": {
        const item = payload.item;
        if (!isDraftItem(item)) return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
        if (item._id) {
          // update item
          const updatedItem = await ItemModel.findOneAndUpdate(
            { _id: item._id, workspaceId },
            {
              $set: {
                date: new Date(item.date),
                cost: item.cost,
                currency: item.currency,
                description: item.description,
                category: item.category,
                subcategory: item.subcategory,
                tag: item.tag,
              },
            },
            { new: true, runValidators: true },
          ).lean<{ _id: Types.ObjectId; description?: string }>();
          if (!updatedItem) return NextResponse.json({ status: "error", message: "Item not found" }, { status: 404 });
          // send push notification
          await sendWorkspacePush({
            itemId: updatedItem._id.toString(),
            actorUserId: userId.toString(),
            memberships,
            title: "Item Updated",
            body: `${userEmail} updated "${updatedItem.description || "an item"}"`,
          });
        } else {
          // add item
          const createdItem = await ItemModel.create({
            workspaceId,
            date: new Date(item.date),
            cost: item.cost,
            currency: item.currency,
            description: item.description,
            category: item.category,
            subcategory: item.subcategory,
            tag: item.tag,
            createdBy: userId,
          });
          // create push notification
          await sendWorkspacePush({
            itemId: createdItem._id.toString(),
            actorUserId: userId.toString(),
            memberships,
            title: "Item Added",
            body: `${userEmail} added "${createdItem.description || "an item"}"`,
          });
        }
        break;
      }

      case "delete": {
        if (typeof payload.itemId !== "string" || !Types.ObjectId.isValid(payload.itemId))
          return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
        const deletedItem = await ItemModel.findOneAndDelete({ _id: payload.itemId, workspaceId }).lean<{
          _id: Types.ObjectId;
          description?: string;
        }>();
        if (!deletedItem) return NextResponse.json({ status: "error", message: "Item not found" }, { status: 404 });
        // send push notification
        await sendWorkspacePush({
          itemId: deletedItem._id.toString(),
          actorUserId: userId.toString(),
          memberships,
          title: "Item Deleted",
          body: `${userEmail} deleted "${deletedItem.description || "an item"}"`,
        });
        break;
      }

      default: {
        // const _exhaustiveCheck: never = payload.type; // check if every case is handled
        return NextResponse.json({ status: "error", message: "Invalid operation type." }, { status: 400 });
      }
    }

    // const recipientUserIds = memberships.filter((m) => m.userId.toString() !== userId.toString()).map((m) => m.userId);
    // const subscriptions = await PushSubscriptionModel.find({
    //   userId: { $in: recipientUserIds },
    // }).lean();

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
};

async function sendWorkspacePush({
  itemId,
  actorUserId,
  memberships,
  title,
  body,
}: {
  itemId: string;
  actorUserId: string;
  memberships: { userId: Types.ObjectId; role: Role }[];
  title: string;
  body: string;
}) {
  // const memberUserIds = memberships.filter((m) => m.userId.toString() !== actorUserId).map((m) => m.userId);
  const memberUserIds = memberships.map((m) => m.userId);
  if (!memberUserIds.length) return;

  const subscriptions = await PushSubscriptionModel.find({
    userId: { $in: memberUserIds },
  }).lean<{ endpoint: string; keys: { p256dh: string; auth: string } }[]>();

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const res = await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify({ title, body, itemId }));
    }),
  );
}
