import { Settings, Item } from "@/db/UserModel";

export type User = {
  settings: Settings;
  items: Item[];
};
