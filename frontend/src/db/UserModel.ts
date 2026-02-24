import mongoose, { Document, Schema, Types } from "mongoose";

export type CategoryObject = { category: string; subcategories: string[] };

export type Settings = {
  email: string;
  defaultCurrency: string;
  categoryObjects: CategoryObject[];
  tags: string[];
};

export type Item = {
  _id?: Types.ObjectId | string;
  date: Date;
  cost: number;
  currency: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string;
};

export interface IUser extends Document {
  hashedPassword: string;
  settings: Settings;
  items: Item[];
}

const UserSchema: Schema = new Schema<IUser>({
  hashedPassword: String,
  settings: {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    defaultCurrency: { type: String, required: true, uppercase: true, match: /^[A-Z]{3}$/, default: "USD" },
    categoryObjects: {
      type: [
        {
          category: { type: String, required: true, trim: true },
          subcategories: [{ type: String, required: true, trim: true }],
        },
      ],
      default: [{ category: "none", subcategories: ["none"] }],
    },
    tags: {
      type: [{ type: String, required: true, trim: true }],
      default: ["none"],
    },
  },
  items: {
    type: [
      {
        date: { type: Date, required: true },
        cost: { type: Number, required: true },
        currency: { type: String, required: true, uppercase: true, match: /^[A-Z]{3}$/ },
        description: { type: String, required: true, trim: true, maxlength: 100 },
        category: { type: String, required: true, trim: true },
        subcategory: { type: String, required: true, trim: true },
        tags: { type: String, required: true, trim: true },
      },
    ],
    default: [],
  },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
