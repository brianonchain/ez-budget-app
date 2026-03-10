import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPendingWorkspaceInvite extends Document {
  workspaceId: Types.ObjectId;
  invitedEmail: string;
  invitedRole: "editor" | "viewer";
  invitedByUserId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PendingWorkspaceInviteSchema = new Schema<IPendingWorkspaceInvite>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    invitedEmail: { type: String, required: true, trim: true, lowercase: true, index: true },
    invitedRole: { type: String, enum: ["editor", "viewer"], required: true },
    invitedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

PendingWorkspaceInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PendingWorkspaceInviteSchema.index({ workspaceId: 1, invitedEmail: 1 }, { unique: true });

export default mongoose.models.PendingWorkspaceInvite ||
  mongoose.model<IPendingWorkspaceInvite>("PendingWorkspaceInvite", PendingWorkspaceInviteSchema);
