import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { MutateItemsPayload } from "@/utils/types";
import { authOptions } from "@/utils/authOptions";

export const POST = async (request: Request) => {
  const payload = (await request.json().catch(() => null)) as MutateItemsPayload | null;
  // payload validation
  if (!payload || !["upsert", "delete"].includes(payload.type)) {
    return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
  }

  // authentication
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    switch (payload.type) {
      case "upsert": {
        // validation
        if (!payload.item) {
          return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
        }
        // edit or add item
        if (payload.item._id) {
          const result = await UserModel.updateOne(
            { "settings.email": email, "items._id": payload.item._id },
            { $set: { "items.$": payload.item } },
            { runValidators: true }
          );
          if (!result.matchedCount) {
            return NextResponse.json({ status: "error", message: "Item not found" }, { status: 404 }); // matchedCount = how many docs matched above filter
          }
        } else {
          await UserModel.updateOne({ "settings.email": email }, { $push: { items: payload.item } }, { runValidators: true });
        }
        break;
      }

      case "delete": {
        // validation
        if (!payload.itemId || typeof payload.itemId !== "string" || !payload.itemId.trim()) {
          return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
        }
        // delete item
        const result = await UserModel.updateOne({ "settings.email": email }, { $pull: { items: { _id: payload.itemId } } });
        if (!result.modifiedCount) {
          return NextResponse.json({ status: "error", message: "Item not found" }, { status: 404 });
        }
        break;
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
};
