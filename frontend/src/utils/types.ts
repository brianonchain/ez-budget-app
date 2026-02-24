import { Settings, Item } from "@/db/UserModel";

export type UserData = {
  settings: Settings;
  items: Item[];
};

export type MutateItemsPayload = { op: "upsert"; item: Item } | { op: "delete"; itemId: string };

export type MutateSettingsOp =
  | { type: "renameTagEverywhere"; from: string; to: string }
  | { type: "deleteTag"; tag: string }
  | { type: "deleteCategory"; category: string };

export type MutateSettingsPayload = {
  changes?: Record<string, unknown>;
  ops?: MutateSettingsOp[];
};
