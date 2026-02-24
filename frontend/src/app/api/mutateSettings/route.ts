import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { MutateSettingsOp } from "@/utils/types";

export const POST = async (request: Request) => {
  const { changes, ops } = (await request.json().catch(() => ({}))) as {
    changes?: Record<string, unknown>;
    ops?: MutateSettingsOp[];
  };

  if ((!changes || Object.keys(changes).length === 0) && (!ops || ops.length === 0)) {
    return NextResponse.json({ status: "error", message: "Nothing to update." }, { status: 400 });
  }

  const session = await getServerSession();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });

  // update db
  try {
    await dbConnect();

    // 1) Apply simple $set changes (if provided)
    if (changes && Object.keys(changes).length > 0) {
      await UserModel.updateOne({ "settings.email": email }, { $set: changes });
    }

    // 2) Apply special ops
    if (ops?.length) {
      for (const op of ops) {
        switch (op.type) {
          case "deleteCategory": {
            const category = op.category?.trim();
            if (!category) {
              return NextResponse.json({ status: "error", message: "Missing category field." }, { status: 400 });
            }
            if (category.toLowerCase() === "none") {
              return NextResponse.json({ status: "error", message: 'Cannot delete "none".' }, { status: 400 });
            }
            const used = await UserModel.exists({
              "settings.email": email,
              items: { $elemMatch: { category } },
            });
            if (used) {
              return NextResponse.json(
                { status: "error", message: "This category is being used in at least one item. Remove it from all items before deleting." },
                { status: 409 }
              );
            }
            await UserModel.updateOne({ "settings.email": email }, { $pull: { "settings.categoryObjects": { category } } });
            break;
          }

          case "renameTagEverywhere": {
            const from = op.from?.trim();
            const to = op.to?.trim();
            if (!from || !to) {
              return NextResponse.json({ status: "error", message: "Missing tag fields." }, { status: 400 });
            }
            if (to.toLowerCase() === "none") {
              return NextResponse.json({ status: "error", message: 'Cannot use "none" as a tag.' }, { status: 400 });
            }
            await UserModel.updateOne(
              { "settings.email": email },
              { $set: { "items.$[it].tags": to } },
              { arrayFilters: [{ "it.tags": from }] }
            );
            break;
          }

          case "deleteTag": {
            const tag = op.tag?.trim();
            if (!tag) {
              return NextResponse.json({ status: "error", message: "Missing tag field." }, { status: 400 });
            }
            if (tag.toLowerCase() === "none") {
              return NextResponse.json({ status: "error", message: 'Cannot use "none" as a tag.' }, { status: 400 });
            }
            const used = await UserModel.exists({
              "settings.email": email,
              items: { $elemMatch: { tags: tag } },
            });
            if (used) {
              return NextResponse.json(
                { status: "error", message: "This tag is being used in at least one item. Remove it from all items before deleting." },
                { status: 409 }
              );
            }
            await UserModel.updateOne({ "settings.email": email }, { $pull: { "settings.tags": tag } });
            break;
          }

          default: {
            const _exhaustiveCheck: never = op;
            return NextResponse.json({ status: "error", message: "Invalid operation type." }, { status: 400 });
          }
        }
      }
    }
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ status: "error", message: "User data failed to update. Please try again." }, { status: 500 });
  }
};
