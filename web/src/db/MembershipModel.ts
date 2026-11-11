import mongoose, { Document, Schema, Types } from "mongoose";

export type WorkspaceRole = "owner" | "editor" | "viewer";

export interface IMembership extends Document {
  userId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  role: WorkspaceRole;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    role: { type: String, enum: ["owner", "editor", "viewer"], required: true, default: "editor" },
  },
  { timestamps: true }
);

// one membership per user per workspace
MembershipSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

export default mongoose.models.Membership || mongoose.model<IMembership>("Membership", MembershipSchema);
