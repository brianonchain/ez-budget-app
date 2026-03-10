import { CategoryObject } from "@/db/WorkspaceModel";
import { DraftItem } from "./types";
import { Types } from "mongoose";

export function isString(value: unknown): value is string {
  return typeof value === "string";
}
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isObjectIdString(value: unknown): value is string {
  return typeof value === "string" && Types.ObjectId.isValid(value);
}

export function isCategoryObject(value: unknown): value is CategoryObject {
  return isObject(value) && isString(value.category) && isStringArray(value.subcategories);
}

export function isDraftItem(value: unknown): value is DraftItem {
  return (
    isObject(value) &&
    isString(value.date) &&
    typeof value.cost === "number" &&
    Number.isFinite(value.cost) &&
    isString(value.currency) &&
    isString(value.description) &&
    isString(value.category) &&
    isString(value.subcategory) &&
    isString(value.tag) &&
    (value._id === undefined || isString(value._id)) &&
    (value.createdBy === undefined || (isObject(value.createdBy) && isString(value.createdBy._id) && isString(value.createdBy.email)))
  );
}
