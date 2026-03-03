import { Settings, Item, CategoryObject } from "@/db/UserModel";
import { CURRENCIES } from "./constants";

export type Currency = (typeof CURRENCIES)[number];

export type UserData = {
  settings: Settings;
  items: Item[];
};

export type MutateItemsPayload = { type: "upsert"; item: Item } | { type: "delete"; itemId: string };

export type MutateSettingsPayload =
  | { type: "addTag"; tag: string }
  | { type: "reorderTags"; tags: string[] }
  | { type: "renameTag"; from: string; to: string }
  | { type: "deleteTag"; tag: string }
  | { type: "addCategoryObject"; categoryObject: CategoryObject }
  | { type: "reorderCategoryObjects"; categoryObjects: CategoryObject[] }
  | { type: "deleteCategoryObject"; category: string }
  | { type: "renameCategory"; from: string; to: string }
  | { type: "addSubcategory"; category: string; subcategory: string }
  | { type: "renameSubcategory"; category: string; from: string; to: string }
  | { type: "deleteSubcategory"; category: string; subcategory: string }
  | { type: "reorderSubcategory"; category: string; fromIndex: number; toIndex: number }
  | { type: "changeCurrency"; currency: string };
