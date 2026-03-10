import mongoose, { Document, Schema, Types } from "mongoose";

export interface IItem extends Document {
  workspaceId: Types.ObjectId;
  date: Date;
  cost: number;
  currency: string;
  description: string;
  category: string;
  subcategory: string;
  tag: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    date: { type: Date, required: true },
    cost: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, match: /^[A-Z]{3}$/ },
    description: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, required: true, trim: true },
    tag: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// key performance index for workspace feeds + date range queries
ItemSchema.index({ workspaceId: 1, date: -1 });

export default mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);
