import { Settings, Item, CategoryObject } from "@/db/UserModel";

export type UserData = {
  settings: Settings;
  items: Item[];
};

export type MutateItemsPayload = { type: "upsert"; item: Item } | { type: "delete"; itemId: string };

export type MutateSettingsPayload =
  | { type: "addTag"; tag: string }
  | { type: "setTags"; tags: string[] }
  | { type: "renameTag"; from: string; to: string }
  | { type: "deleteTag"; tag: string }
  | { type: "addCategoryObject"; categoryObject: CategoryObject }
  | { type: "setCategoryObjects"; categoryObjects: CategoryObject[] }
  | { type: "renameCategory"; from: string; to: string }
  | { type: "deleteCategory"; category: string }
  | { type: "addSubcategory"; category: string; subcategory: string }
  | { type: "renameSubcategory"; category: string; from: string; to: string }
  | { type: "deleteSubcategory"; category: string; subcategory: string }
  | { type: "changeCurrency"; currency: string };
