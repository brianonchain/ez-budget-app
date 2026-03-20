import dbConnect from "@/db/dbConnect";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { MutateSettingsPayload, Role } from "@/utils/types";
import { CURRENCIES } from "@/utils/constants";
import MembershipModel from "@/db/MembershipModel";
import WorkspaceModel from "@/db/WorkspaceModel";
import ItemModel from "@/db/ItemModel";
import { CategoryObject } from "@/db/WorkspaceModel";
import { createIsUsedMsg } from "@/utils/functions";
import { getUserInfo } from "@/utils/serverFunctions";
import { isStringArray, isCategoryObject, isDraftItem, isObjectIdString } from "@/utils/typeGuards";

export const POST = async (request: Request) => {
  const payload = (await request.json().catch(() => null)) as MutateSettingsPayload | null;
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

    // SECURITY GATE for ALL MUTATIONS
    const membership = await MembershipModel.findOne({ userId, workspaceId }).select("role").lean<{ role: Role } | null>();
    if (!membership || membership.role === "viewer") {
      return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
    }

    switch (payload.type) {
      case "addTag": {
        // type check
        if (typeof payload.tag !== "string") return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // normalize
        const tag = payload.tag.trim();
        // exists
        if (!tag) return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // "none"
        if (tag.toLowerCase() === "none") return NextResponse.json({ status: "error", message: 'Cannot use "none".' }, { status: 400 });
        // $addToSet prevents duplicates. TODO: not ideal because allows food and Food. At least a case-insensitive validation exists in frontend. Correct way is to use a very long MongoDB aggregation; best alternative might be to add tagsLowercase[] in User schema
        const result = await WorkspaceModel.updateOne({ _id: workspaceId }, { $addToSet: { tags: tag } });
        if (result.modifiedCount === 0) return NextResponse.json({ status: "error", message: "Tag already exists." }, { status: 409 });
        break;
      }

      case "reorderTags": {
        // type check
        if (!isStringArray(payload.tags)) return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // normalize
        const tags = payload.tags.map((t) => t.trim()).filter((t) => t !== "");
        // exists
        if (tags.length === 0 || tags[0] !== "none")
          return NextResponse.json({ status: "error", message: 'First tag must be "none".' }, { status: 400 });
        // "none"
        if (tags.slice(1).some((t) => t.toLowerCase() === "none"))
          return NextResponse.json({ status: "error", message: 'Cannot use "none" as a tag.' }, { status: 400 });
        // duplicates
        const lowered = tags.map((t) => t.toLowerCase());
        if (new Set(lowered).size !== lowered.length)
          return NextResponse.json({ status: "error", message: "Duplicate tags." }, { status: 409 });
        await WorkspaceModel.updateOne({ _id: workspaceId }, { $set: { tags } });
        break;
      }

      case "renameTag": {
        // type check
        if (typeof payload.from !== "string" || typeof payload.to !== "string")
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // normalize
        const from = payload.from.trim();
        const to = payload.to.trim();
        // exists
        if (!from || !to) return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // "none"
        if (from.toLowerCase() === "none") return NextResponse.json({ status: "error", message: 'Cannot rename "none".' }, { status: 400 });
        if (to.toLowerCase() === "none") return NextResponse.json({ status: "error", message: 'Cannot use "none".' }, { status: 400 });
        // duplicates (allow food => Food). TODO: not ideal because race conditions; Aggregation better but complex; alternative may be to add a tagsLowercase[] in User schema
        const workspace = await WorkspaceModel.findById(workspaceId).select("tags").lean<{ tags: string[] } | null>();
        if (!workspace) return NextResponse.json({ status: "error", message: "Workspace not found." }, { status: 404 });
        if (from.toLowerCase() !== to.toLowerCase() && workspace.tags.some((t) => t.toLowerCase() === to.toLowerCase()))
          return NextResponse.json({ status: "error", message: "Tag already exists." }, { status: 409 });
        // mutation
        const result = await WorkspaceModel.updateOne({ _id: workspaceId }, { $set: { "tags.$[t]": to } }, { arrayFilters: [{ t: from }] });
        if (result.modifiedCount === 0) return NextResponse.json({ status: "error", message: "Tag not found." }, { status: 404 });
        await ItemModel.updateMany({ workspaceId, tag: from }, { $set: { tag: to } });
        break;
      }

      case "deleteTag": {
        // type check
        if (typeof payload.tag !== "string") return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // normalize
        const tag = payload.tag.trim();
        // exists
        if (!tag) return NextResponse.json({ status: "error", message: `Invalid payload. Missing "tag".` }, { status: 400 });
        // "none"
        if (tag.toLowerCase() === "none") return NextResponse.json({ status: "error", message: 'Cannot delete "none".' }, { status: 400 });
        // being used
        const used = await ItemModel.exists({ workspaceId, tag });
        if (used) return NextResponse.json({ status: "error", message: createIsUsedMsg("tag") }, { status: 409 });
        // mutation
        await WorkspaceModel.updateOne({ _id: workspaceId }, { $pull: { tags: tag } });
        break;
      }

      case "addCategoryObject": {
        // type check
        if (!isCategoryObject(payload.categoryObject))
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // normalize
        const category = payload.categoryObject.category.trim();
        const subcategories = payload.categoryObject.subcategories.map((s) => s.trim()).filter((s) => s !== "");
        // exists
        if (!category || subcategories.length === 0 || subcategories[0] !== "none")
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // "none"
        if (category.toLowerCase() === "none" || subcategories.slice(1).some((s) => s.toLowerCase() === "none"))
          return NextResponse.json({ status: "error", message: `Category or subcategory cannot be "none".` }, { status: 400 });
        // subcategory duplicates
        const lowered = subcategories.map((s) => s.toLowerCase());
        if (new Set(lowered).size !== lowered.length) {
          return NextResponse.json({ status: "error", message: "Subcategories contain duplicates." }, { status: 409 });
        }
        // category duplicates
        const workspace = await WorkspaceModel.findById(workspaceId)
          .select("categoryObjects")
          .lean<{ categoryObjects: CategoryObject[] } | null>();
        const exists = workspace?.categoryObjects.some((i) => i.category.toLowerCase() === category.toLowerCase());
        if (exists) return NextResponse.json({ status: "error", message: "Category already exists." }, { status: 409 });
        // mutation
        await WorkspaceModel.updateOne({ _id: workspaceId }, { $push: { categoryObjects: { category, subcategories } } });
        break;
      }

      case "reorderCategoryObjects": {
        // type check
        if (!Array.isArray(payload.categoryObjects) || !payload.categoryObjects.every(isCategoryObject))
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // normalize
        const categoryObjects = payload.categoryObjects.map((c) => ({
          category: c.category.trim(),
          subcategories: c.subcategories.map((s) => s.trim()).filter((s) => s !== ""),
        }));
        // exists
        if (categoryObjects.length === 0 || categoryObjects[0].category !== "none")
          return NextResponse.json({ status: "error", message: 'First category must be "none".' }, { status: 400 });
        // "none"
        if (categoryObjects.slice(1).some((c) => c.category.toLowerCase() === "none"))
          return NextResponse.json({ status: "error", message: 'Cannot use "none" as a category.' }, { status: 400 });
        // prevent duplicate categories
        const lowered = categoryObjects.map((c) => c.category.toLowerCase());
        if (new Set(lowered).size !== lowered.length)
          return NextResponse.json({ status: "error", message: "Duplicate categories." }, { status: 409 });
        // mutation
        await WorkspaceModel.updateOne({ _id: workspaceId }, { $set: { categoryObjects } });
        break;
      }

      case "renameCategory": {
        // type check
        if (typeof payload.from !== "string" || typeof payload.to !== "string") {
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        }
        // normalize
        const from = payload.from.trim();
        const to = payload.to.trim();
        // exists
        if (!from || !to) return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // "none"
        if (from.toLowerCase() === "none") return NextResponse.json({ status: "error", message: 'Cannot rename "none".' }, { status: 400 });
        if (to.toLowerCase() === "none") return NextResponse.json({ status: "error", message: 'Cannot use "none".' }, { status: 400 });
        // duplicates (allow food => Food)
        const workspace = await WorkspaceModel.findById(workspaceId)
          .select("categoryObjects")
          .lean<{ categoryObjects: CategoryObject[] } | null>();
        if (!workspace) return NextResponse.json({ status: "error", message: "Workspace not found." }, { status: 404 });
        if (
          from.toLowerCase() !== to.toLowerCase() &&
          workspace.categoryObjects?.some((i) => i.category.toLowerCase() === to.toLowerCase())
        ) {
          return NextResponse.json({ status: "error", message: "Category already exists." }, { status: 409 });
        }
        // mutation
        const result = await WorkspaceModel.updateOne(
          { _id: workspaceId },
          { $set: { "categoryObjects.$[c].category": to } },
          { arrayFilters: [{ "c.category": from }] }
        );
        if (result.modifiedCount === 0) return NextResponse.json({ status: "error", message: "Category not found." }, { status: 404 });
        await ItemModel.updateMany({ workspaceId, category: from }, { $set: { category: to } });
        break;
      }

      case "deleteCategoryObject": {
        // type check category only
        if (typeof payload.category !== "string")
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // normalize
        const category = payload.category.trim();
        // exists
        if (!category) return NextResponse.json({ status: "error", message: `Invalid payload. Missing "category".` }, { status: 400 });
        // "none"
        if (category.toLowerCase() === "none")
          return NextResponse.json({ status: "error", message: 'Cannot delete "none".' }, { status: 400 });
        // being used
        const used = await ItemModel.exists({ workspaceId, category });
        if (used) return NextResponse.json({ status: "error", message: createIsUsedMsg("category") }, { status: 409 });
        // mutation
        await WorkspaceModel.updateOne({ _id: workspaceId }, { $pull: { categoryObjects: { category } } });
        break;
      }

      case "addSubcategory": {
        // type check
        if (typeof payload.category !== "string" || typeof payload.subcategory !== "string")
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // normalize
        const category = payload.category.trim();
        const subcategory = payload.subcategory.trim();
        // exists
        if (!category || !subcategory) return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // "none"
        if (subcategory.toLowerCase() === "none")
          return NextResponse.json({ status: "error", message: 'Cannot use "none" as a subcatgory.' }, { status: 400 });
        // check if subcategory exists
        const workspace = await WorkspaceModel.findOne(
          { _id: workspaceId, "categoryObjects.category": category },
          { categoryObjects: { $elemMatch: { category } } }
        ).lean<{ categoryObjects: CategoryObject[] } | null>();
        const exists = workspace?.categoryObjects?.[0]?.subcategories?.some((s) => s.toLowerCase() === subcategory.toLowerCase());
        if (exists) return NextResponse.json({ status: "error", message: "Subcategory already exists." }, { status: 409 });
        // mutation
        const result = await WorkspaceModel.updateOne(
          { _id: workspaceId },
          { $push: { "categoryObjects.$[c].subcategories": subcategory } },
          { arrayFilters: [{ "c.category": category }] }
        );
        if (result.modifiedCount === 0) {
          return NextResponse.json({ status: "error", message: "Category not found." }, { status: 404 });
        }
        break;
      }

      case "renameSubcategory": {
        // type check
        if (typeof payload.category !== "string" || typeof payload.from !== "string" || typeof payload.to !== "string") {
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        }
        // normalize
        const category = payload.category.trim();
        const from = payload.from.trim();
        const to = payload.to.trim();
        // exists
        if (!category || !from || !to) return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // "none"
        if (from.toLowerCase() === "none") return NextResponse.json({ status: "error", message: `Cannot rename "none".` }, { status: 400 });
        if (to.toLowerCase() === "none") return NextResponse.json({ status: "error", message: 'Cannot use "none".' }, { status: 400 });
        // duplicates (allow food => Food)
        const workspace = await WorkspaceModel.findOne(
          { _id: workspaceId, "categoryObjects.category": category },
          { categoryObjects: { $elemMatch: { category } } }
        ).lean<{ categoryObjects: CategoryObject[] } | null>();
        if (
          from.toLowerCase() !== to.toLowerCase() &&
          workspace?.categoryObjects[0]?.subcategories?.some((i) => i.toLowerCase() === to.toLowerCase())
        ) {
          return NextResponse.json({ status: "error", message: "Subcategories contain duplicates." }, { status: 409 });
        }
        // mutation
        const result = await WorkspaceModel.updateOne(
          { _id: workspaceId },
          { $set: { "categoryObjects.$[c].subcategories.$[s]": to } },
          { arrayFilters: [{ "c.category": category }, { s: from }] }
        );
        if (result.modifiedCount === 0)
          return NextResponse.json({ status: "error", message: "Category or subcategory not found." }, { status: 404 });
        await ItemModel.updateMany({ workspaceId, category, subcategory: from }, { $set: { subcategory: to } });
        break;
      }

      case "deleteSubcategory": {
        // type check
        if (typeof payload.category !== "string" || typeof payload.subcategory !== "string") {
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        }
        // normalize
        const category = payload.category.trim();
        const subcategory = payload.subcategory.trim();
        // exists
        if (!category || !subcategory) return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // "none"
        if (subcategory.toLowerCase() === "none")
          return NextResponse.json({ status: "error", message: 'Cannot delete "none".' }, { status: 400 });
        // being used
        const used = await ItemModel.exists({ workspaceId, category, subcategory });
        if (used) return NextResponse.json({ status: "error", message: createIsUsedMsg("subcategory") }, { status: 409 });
        // mutation
        await WorkspaceModel.updateOne(
          { _id: workspaceId },
          { $pull: { "categoryObjects.$[c].subcategories": subcategory } },
          { arrayFilters: [{ "c.category": category }] }
        );
        break;
      }

      case "reorderSubcategory": {
        const category = payload.category?.trim();
        if (!category || !Number.isInteger(payload.fromIndex) || !Number.isInteger(payload.toIndex)) {
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        }

        const from = payload.fromIndex + 1;
        const to = payload.toIndex + 1;

        if (from === to) {
          return NextResponse.json({ status: "success" }, { status: 200 });
        }

        const workspace = await WorkspaceModel.findOne(
          { _id: workspaceId, "categoryObjects.category": category },
          { categoryObjects: { $elemMatch: { category } } }
        ).lean<{ categoryObjects: CategoryObject[] } | null>();

        if (!workspace?.categoryObjects?.[0]) {
          return NextResponse.json({ status: "error", message: "Workspace or category not found." }, { status: 404 });
        }

        const subcategories = workspace.categoryObjects[0].subcategories;

        if (subcategories[0]?.toLowerCase() !== "none") {
          return NextResponse.json({ status: "error", message: `Invalid subcategory list (missing "none").` }, { status: 500 });
        }

        if (from <= 0 || to <= 0 || from >= subcategories.length || to >= subcategories.length) {
          return NextResponse.json({ status: "error", message: "Index out of bounds." }, { status: 400 });
        }

        const next = [...subcategories];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);

        const result = await WorkspaceModel.updateOne(
          { _id: workspaceId },
          { $set: { "categoryObjects.$[c].subcategories": next } },
          { arrayFilters: [{ "c.category": category }] }
        );

        if (result.modifiedCount === 0) {
          return NextResponse.json({ status: "error", message: "Category not found." }, { status: 404 });
        }
        break;
      }

      case "changeCurrency": {
        const currency = payload.currency;
        if (!currency) return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        if (!CURRENCIES.includes(currency))
          return NextResponse.json({ status: "error", message: "Currency not supported." }, { status: 400 });
        await WorkspaceModel.updateOne({ _id: workspaceId }, { $set: { defaultCurrency: currency } });
        break;
      }

      case "setDiscretionaryBudget": {
        const { amount, currency } = payload;
        // check type
        if (typeof amount !== "number" || amount < 0 || !CURRENCIES.includes(currency))
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        // mutate
        await WorkspaceModel.updateOne(
          { _id: workspaceId },
          { $set: { "discretionaryBudget.amount": amount, "discretionaryBudget.currency": currency } }
        );
        break;
      }

      case "setDiscretionaryBudgetCategories": {
        if (!Array.isArray(payload.categoryObjects) || !payload.categoryObjects.every(isCategoryObject))
          return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        const categoryObjects = payload.categoryObjects;
        for (const co of categoryObjects) {
          if (!co.category || co.subcategories.length === 0)
            return NextResponse.json({ status: "error", message: "Invalid payload." }, { status: 400 });
        }
        await WorkspaceModel.updateOne({ _id: workspaceId }, { $set: { "discretionaryBudget.categoryObjects": categoryObjects } });
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
