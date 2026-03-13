import mongoose, { Document, Schema, Types } from "mongoose";

export type CategoryObject = { category: string; subcategories: string[] };

export interface IWorkspace extends Document {
  name: string;
  ownerId: Types.ObjectId;
  ownerEmail: string;
  defaultCurrency: string;
  monthlyBudgets: Map<string, { amount: number; currency: string }>;
  categoryObjects: CategoryObject[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ownerEmail: { type: String, required: true, trim: true, lowercase: true },
    defaultCurrency: { type: String, required: true, uppercase: true, match: /^[A-Z]{3}$/, default: "USD" },
    monthlyBudgets: {
      type: Map,
      of: new Schema({ amount: { type: Number, required: true, min: 0 }, currency: { type: String, required: true, uppercase: true } }, { _id: false }),
      default: {},
    },
    categoryObjects: {
      type: [{ category: { type: String, required: true, trim: true }, subcategories: [{ type: String, required: true, trim: true }] }],
      default: [{ category: "none", subcategories: ["none"] }],
    },
    tags: {
      type: [{ type: String, required: true, trim: true }],
      default: ["none"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Workspace || mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);
