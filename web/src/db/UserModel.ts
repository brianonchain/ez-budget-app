import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  email: string;
  hashedPassword?: string; // for credentials users
  activeWorkspaceId?: Types.ObjectId | null; // last workspace user visited
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    hashedPassword: { type: String },
    activeWorkspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
