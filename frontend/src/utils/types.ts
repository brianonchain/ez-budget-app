import { CategoryObject } from "@/db/WorkspaceModel";
import { CURRENCIES } from "./constants";

// useItemsQuery data
export type ItemsData = {
  items: DraftItem[];
  defaultCurrency: string;
};
// 1) id, createdBy doesn't exist for new items, 2) compared to IItem, DraftItem doesn't have workspaceId, createdAt, updatedAt, 3) date is string
export type DraftItem = {
  _id?: string;
  date: string;
  cost: number;
  currency: string;
  description: string;
  category: string;
  subcategory: string;
  tag: string;
  createdBy?: {
    _id: string; // populated
    email: string; // populated
  };
};

// useSettingsQuery data
export type SettingsData = {
  workspace: Workspace;
  role: "owner" | "editor" | "viewer";
  workspaceOptions: WorkspaceOption[];
  sharedUsers: SharedUser[];
  pendingSharedUsers: PendingSharedUser[];
};
export type Workspace = {
  _id: string;
  name: string;
  defaultCurrency: string;
  categoryObjects: CategoryObject[];
  tags: string[];
  ownerId: string;
};
export type WorkspaceOption = {
  _id: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
  role: Role;
};
export type SharedUser = {
  _id: string;
  email: string;
  role: "editor" | "viewer";
};
export type PendingSharedUser = {
  _id: string;
  invitedEmail: string;
  invitedRole: "editor" | "viewer";
  expiresAt: Date;
};
export type Role = "owner" | "editor" | "viewer";

export type MutateItemsPayload =
  | { type: "upsert"; workspaceId: string; item: DraftItem }
  | { type: "delete"; workspaceId: string; itemId: string };

// 1) owners and editors can mutate, 2) payload must have workspaceId, 3) invalidates "settings"
export type MutateSettingsPayload =
  // tags
  | { type: "addTag"; workspaceId: string; tag: string } // tag
  | { type: "renameTag"; workspaceId: string; from: string; to: string } // from, to
  | { type: "reorderTags"; workspaceId: string; tags: string[] } // tags
  | { type: "deleteTag"; workspaceId: string; tag: string } // tag
  // categoryObjects
  | { type: "addCategoryObject"; workspaceId: string; categoryObject: CategoryObject } // categoryObject
  | { type: "renameCategory"; workspaceId: string; from: string; to: string } // from, to
  | { type: "reorderCategoryObjects"; workspaceId: string; categoryObjects: CategoryObject[] } // categoryObjects
  | { type: "deleteCategoryObject"; workspaceId: string; category: string } // category
  // subcategories
  | { type: "addSubcategory"; workspaceId: string; category: string; subcategory: string } // category, subcategory
  | { type: "renameSubcategory"; workspaceId: string; category: string; from: string; to: string } // category, from, to
  | { type: "reorderSubcategory"; workspaceId: string; category: string; fromIndex: number; toIndex: number } // category, fromIndex, toIndex
  | { type: "deleteSubcategory"; workspaceId: string; category: string; subcategory: string } // category, subcategory
  // others
  | { type: "changeCurrency"; workspaceId: string; currency: string }; // currency

// 1) various authorization gates, 2) invalidates "settings" and "items"
export type MutateUserPayload =
  | { type: "addWorkspace"; name: string; defaultCurrency: string }
  | { type: "setActiveWorkspace"; workspaceId: string }
  | { type: "leaveWorkspace"; workspaceId: string }
  | { type: "deleteWorkspace"; workspaceId: string }
  | { type: "shareWorkspace"; workspaceId: string; workspaceName: string; email: string; role: "editor" | "viewer" } // workspaceName, email, role
  | { type: "updateSharedUser"; workspaceId: string; sharedUserId: string; role: "editor" | "viewer" } // sharedUserId, role
  | { type: "deleteSharedUser"; workspaceId: string; sharedUserId: string } // sharedUserId
  | { type: "deletePendingSharedUser"; workspaceId: string; invitedEmail: string } // pendingSharedUserId
  | { type: "deleteAccount"; userId: string }; // userId

export type ResendCodePayload = { type: "resendCodeForNewUser"; email: string } | { type: "resendCodeForEmailChange" };
