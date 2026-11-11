import mongoose, { Document, Schema, Types } from "mongoose";

export type CategoryObject = { category: string; subcategories: string[] };

export interface IWorkspace extends Document {
  name: string;
  ownerId: Types.ObjectId;
  ownerEmail: string;
  defaultCurrency: string;
  discretionaryBudget: {
    amount: number;
    currency: string;
    categoryObjects: CategoryObject[];
  };
  categoryObjects: CategoryObject[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// reusable sub-schema (no _id)
const CategoryObjectSchema = new Schema<CategoryObject>(
  { category: { type: String, required: true, trim: true }, subcategories: [{ type: String, required: true, trim: true }] },
  { _id: false }
);

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ownerEmail: { type: String, required: true, trim: true, lowercase: true },
    defaultCurrency: { type: String, required: true, uppercase: true, match: /^[A-Z]{3}$/, default: "USD" },
    categoryObjects: { type: [CategoryObjectSchema], default: [{ category: "none", subcategories: ["none"] }] },
    tags: { type: [{ type: String, required: true, trim: true }], default: ["none"] },
    discretionaryBudget: {
      type: new Schema(
        {
          amount: { type: Number, required: true, min: 0, default: 0 },
          currency: { type: String, required: true, uppercase: true, match: /^[A-Z]{3}$/, default: "USD" },
          categoryObjects: { type: [CategoryObjectSchema], default: [{ category: "none", subcategories: ["all"] }] },
        },
        { _id: false }
      ),
    },
  },
  { timestamps: true }
);

export default mongoose.models.Workspace || mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);
