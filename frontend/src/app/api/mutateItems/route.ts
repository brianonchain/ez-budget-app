import dbConnect from "@/db/dbConnect";
import { NextResponse } from "next/server";
import { MutateItemsPayload, Role } from "@/utils/types";
import { Types } from "mongoose";
import MembershipModel from "@/db/MembershipModel";
import ItemModel from "@/db/ItemModel";
import { getUserInfo } from "@/utils/serverFunctions";
import { isDraftItem, isObjectIdString } from "@/utils/typeGuards";

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
    const membership = await MembershipModel.findOne({ userId, workspaceId }).select("role").lean<{ role: Role } | null>();
    if (!membership || membership.role === "viewer") {
      return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
    }

    switch (payload.type) {
      case "upsert": {
        const item = payload.item;
        if (!isDraftItem(item)) return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
        // update or add item
        if (payload.item._id) {
          const result = await ItemModel.updateOne(
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
            { runValidators: true },
          );
          if (!result.matchedCount) return NextResponse.json({ status: "error", message: "Item not found" }, { status: 404 });
        } else {
          await ItemModel.create({
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
        }
        break;
      }

      case "delete": {
        if (typeof payload.itemId !== "string" || !Types.ObjectId.isValid(payload.itemId))
          return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
        const result = await ItemModel.deleteOne({ _id: payload.itemId, workspaceId });
        if (!result.deletedCount) return NextResponse.json({ status: "error", message: "Item not found" }, { status: 404 });
        break;
      }

      default: {
        // const _exhaustiveCheck: never = payload.type; // check if every case is handled
        return NextResponse.json({ status: "error", message: "Invalid operation type." }, { status: 400 });
      }
    }
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
};
