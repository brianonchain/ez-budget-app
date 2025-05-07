import mongoose, { Document, Schema } from "mongoose";

export type CategoryObject = { category: string; subcategories: string[] };

export type Settings = {
  email: string;
  currency: string;
  category: { [key: string]: string[] };
  categoryObjects: CategoryObject[];
  tags: string[];
};

export type Item = {
  date: any;
  cost: number;
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
    email: { type: String, unique: true },
    currency: String,
    category: Object,
    categoryObjects: [
      {
        category: String,
        subcategories: [String],
      },
    ],
    tags: [String],
  },
  items: [
    {
      date: Date,
      cost: Number,
      description: String,
      category: String,
      subcategory: String,
      tags: String,
    },
  ],
});

const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
