import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { MutateSettingsPayload } from "@/utils/types";

export const POST = async (request: Request) => {
  const payload = (await request.json().catch(() => null)) as MutateSettingsPayload | null;
  if (!payload) return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });

  const session = await getServerSession();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });

  // update db
  try {
    await dbConnect(); // 2) Apply special ops
    switch (payload.type) {
      case "addTag": {
        const tag = payload.tag?.trim();
        if (!tag) {
          return NextResponse.json({ status: "error", message: `Invalid payload. Missing "tag".` }, { status: 400 });
        }
        if (tag.toLowerCase() === "none") {
          return NextResponse.json({ status: "error", message: 'Invalid payload. Cannot add "none".' }, { status: 400 });
        }
        // Prevent duplicates. TODO: no ideal because allows food and Food. At least a case-insensitive validation exists in frontend.
        // Correct way is to use a very long MongoDB aggregation; best alternative might be to add tagsLowercase[] in User schema
        const result = await UserModel.updateOne({ "settings.email": email }, { $addToSet: { "settings.tags": tag } });
        if (result.modifiedCount === 0) {
          return NextResponse.json({ status: "error", message: "Tag already exists." }, { status: 409 });
        }
        break;
      }

      case "setTags": {
        const tags = payload.tags;
        if (!Array.isArray(tags) || tags.length === 0) {
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        }
        // force "none" at index 0
        if (tags[0] !== "none") {
          return NextResponse.json({ status: "error", message: 'First tag must be "none".' }, { status: 400 });
        }
        // basic cleanup
        const cleaned = tags.map((t) => t.trim()).filter((t) => t.length > 0);
        // prevent duplicates (case-insensitive)
        const lowered = cleaned.map((t) => t.toLowerCase());
        if (new Set(lowered).size !== lowered.length) {
          return NextResponse.json({ status: "error", message: "Duplicate tags." }, { status: 409 });
        }
        // prevent deleting "none"
        if (cleaned[0].toLowerCase() !== "none") {
          return NextResponse.json({ status: "error", message: 'Invalid "none".' }, { status: 400 });
        }
        await UserModel.updateOne({ "settings.email": email }, { $set: { "settings.tags": cleaned } });
        break;
      }

      case "renameTag": {
        const from = payload.from?.trim();
        const to = payload.to?.trim();
        if (!from || !to) {
          return NextResponse.json({ status: "error", message: `Invalid payload. Missing "from" or "to" fields.` }, { status: 400 });
        }
        if (to.toLowerCase() === "none") {
          return NextResponse.json({ status: "error", message: 'Cannot use "none" as a tag.' }, { status: 400 });
        }
        // Prevent duplicates (allows food => Food). TODO: not ideal because race conditions; Aggregation better but complex; alternative may be to add a tagsLowercase[] in User schema
        const user = await UserModel.findOne({ "settings.email": email }, { "settings.tags": 1 }).lean<{ settings: { tags: string[] } }>();
        if (!user) {
          return NextResponse.json({ status: "error", message: "User not found." }, { status: 404 });
        }
        if (from.toLowerCase() !== to.toLowerCase() && user.settings.tags.some((t: string) => t.toLowerCase() === to.toLowerCase())) {
          return NextResponse.json({ status: "error", message: "Tag already exists." }, { status: 409 });
        }
        // mutation
        const result = await UserModel.updateOne(
          { "settings.email": email },
          { $set: { "settings.tags.$[t]": to, "items.$[it].tags": to } },
          { arrayFilters: [{ t: from }, { "it.tags": from }] }
        );
        if (result.modifiedCount === 0) {
          return NextResponse.json({ status: "error", message: "Tag not found." }, { status: 404 });
        }
        break;
      }

      case "deleteTag": {
        const tag = payload.tag?.trim();
        if (!tag) {
          return NextResponse.json({ status: "error", message: `Invalid payload. Missing "tag".` }, { status: 400 });
        }
        if (tag.toLowerCase() === "none") {
          return NextResponse.json({ status: "error", message: 'Invalid payload. Cannot delete "none".' }, { status: 400 });
        }
        const used = await UserModel.exists({ "settings.email": email, items: { $elemMatch: { tags: tag } } });
        if (used) {
          return NextResponse.json(
            { status: "error", message: "This tag is being used in at least one item. Remove it from all items before deleting." },
            { status: 409 }
          );
        }
        await UserModel.updateOne({ "settings.email": email }, { $pull: { "settings.tags": tag } });
        break;
      }

      case "addCategoryObject": {
        const categoryObject = payload.categoryObject;
        if (!categoryObject) {
          return NextResponse.json({ status: "error", message: `Invalid payload. Missing "categoryObject".` }, { status: 400 });
        }
        await UserModel.updateOne({ "settings.email": email }, { $push: { "settings.categoryObjects": categoryObject } });
        break;
      }

      case "setCategoryObjects": {
        const arr = payload.categoryObjects;
        if (!Array.isArray(arr) || arr.length === 0) {
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        }
        // basic safety checks
        const first = arr[0];
        if (!first || first.category !== "none") {
          return NextResponse.json({ status: "error", message: 'First category must be "none".' }, { status: 400 });
        }
        // prevent duplicate categories (case-insensitive)
        const cats = arr.map((c) => c.category?.trim()).filter(Boolean);
        const lowered = cats.map((c) => c!.toLowerCase());
        if (new Set(lowered).size !== lowered.length) {
          return NextResponse.json({ status: "error", message: "Duplicate categories." }, { status: 409 });
        }
        await UserModel.updateOne({ "settings.email": email }, { $set: { "settings.categoryObjects": arr } });
        break;
      }

      case "deleteCategory": {
        const category = payload.category?.trim();
        if (!category) {
          return NextResponse.json({ status: "error", message: `Invalid payload. Missing "category".` }, { status: 400 });
        }
        if (category.toLowerCase() === "none") {
          return NextResponse.json({ status: "error", message: 'Invalid payload. Cannot delete "none".' }, { status: 400 });
        }
        const used = await UserModel.exists({ "settings.email": email, items: { $elemMatch: { category: category } } });
        if (used) {
          return NextResponse.json(
            { status: "error", message: "This category is being used in at least one item. Remove it from all items before deleting." },
            { status: 409 }
          );
        }
        await UserModel.updateOne({ "settings.email": email }, { $pull: { "settings.categoryObjects": { category: category } } });
        break;
      }

      case "changeCurrency": {
        const currency = payload.currency?.trim();
        if (!currency) {
          return NextResponse.json({ status: "error", message: `Invalid payload. Missing "currency".` }, { status: 400 });
        }
        if (!/^[A-Z]{3}$/.test(currency)) {
          return NextResponse.json({ status: "error", message: "Currency must be 3 uppercase letters." }, { status: 400 });
        }
        if (!["USD", "TWD", "EUR", "JPY"].includes(currency)) {
          return NextResponse.json({ status: "error", message: "Currency not supported." }, { status: 400 });
        }
        await UserModel.updateOne({ "settings.email": email }, { $set: { "settings.defaultCurrency": currency } });
        break;
      }

      default: {
        // const _exhaustiveCheck: never = payload.type; // check if every case is handled
        return NextResponse.json({ status: "error", message: "Invalid operation type." }, { status: 400 });
      }
    }
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ status: "error", message: "User data failed to update. Please try again." }, { status: 500 });
  }
};
