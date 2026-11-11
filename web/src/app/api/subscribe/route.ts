import dbConnect from "@/db/dbConnect";
import PushSubscriptionModel from "@/db/PushSubscriptionModel";
import { getUserInfo } from "@/utils/serverFunctions";
import { NextResponse } from "next/server";
import type { MutateSubscribePayload } from "@/utils/types";

export const POST = async (request: Request) => {
  const payload = (await request.json().catch(() => null)) as MutateSubscribePayload | null;
  if (!payload || !payload.type) return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });

  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId } = userInfo;

  try {
    await dbConnect();

    switch (payload.type) {
      case "subscribe": {
        console.log("subscribing...");
        // validate payload
        if (
          typeof payload.endpoint !== "string" ||
          payload.endpoint.length === 0 ||
          !payload.keys ||
          typeof payload.keys.p256dh !== "string" ||
          payload.keys.p256dh.length === 0 ||
          typeof payload.keys.auth !== "string" ||
          payload.keys.auth.length === 0
        )
          return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
        // update or create
        await PushSubscriptionModel.updateOne(
          { endpoint: payload.endpoint },
          {
            $set: {
              userId,
              endpoint: payload.endpoint,
              keys: { p256dh: payload.keys.p256dh, auth: payload.keys.auth },
              userAgent: request.headers.get("user-agent") ?? undefined,
            },
          },
          { upsert: true, runValidators: true },
        );
        break;
      }

      case "unsubscribe": {
        console.log("unsubscribing...");
        // validate payload
        if (typeof payload.endpoint !== "string" || payload.endpoint.length === 0)
          return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
        // delete
        await PushSubscriptionModel.deleteOne({ endpoint: payload.endpoint, userId });
        break;
      }

      default: {
        return NextResponse.json({ status: "error", message: "Invalid operation type." }, { status: 400 });
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
};
