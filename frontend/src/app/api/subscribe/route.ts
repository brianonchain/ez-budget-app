import dbConnect from "@/db/dbConnect";
import PushSubscriptionModel from "@/db/PushSubscriptionModel";
import { getUserInfo } from "@/utils/serverFunctions";
import { NextResponse } from "next/server";

type PushSubscribePayload = {
  endpoint?: string;
  // expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
  expirationTime?: number | null;
};

function isValidPushSubscription(payload: unknown): payload is Required<Pick<PushSubscribePayload, "endpoint" | "keys">> {
  if (!payload || typeof payload !== "object") return false;
  const sub = payload as PushSubscribePayload;
  return (
    typeof sub.endpoint === "string" &&
    sub.endpoint.length > 0 &&
    typeof sub.keys?.p256dh === "string" &&
    sub.keys.p256dh.length > 0 &&
    typeof sub.keys?.auth === "string" &&
    sub.keys.auth.length > 0
  );
}

export const POST = async (request: Request) => {
  // authentication
  const userInfo = await getUserInfo();
  if (!userInfo) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  const { userId } = userInfo;

  // validate payload
  const payload = (await request.json().catch(() => null)) as PushSubscribePayload | null;
  if (!isValidPushSubscription(payload)) {
    return NextResponse.json({ status: "error", message: "Invalid push subscription" }, { status: 400 });
  }

  try {
    await dbConnect();
    await PushSubscriptionModel.updateOne(
      { endpoint: payload.endpoint },
      {
        $set: {
          userId,
          endpoint: payload.endpoint,
          keys: {
            p256dh: payload.keys.p256dh,
            auth: payload.keys.auth,
          },
          userAgent: request.headers.get("user-agent") ?? undefined,
        },
      },
      { upsert: true, runValidators: true },
    );

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Database error" }, { status: 500 });
  }
};
