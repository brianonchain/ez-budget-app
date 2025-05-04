import mongoose, { Document, Schema } from "mongoose";

export interface IPendingUser extends Document {
  email: string;
  password: string;
  hashedPassword: string;
  otp: string;
  createdAt: Date;
}

const PendingUserSchema: Schema = new Schema<IPendingUser>({
  email: String,
  password: String,
  hashedPassword: String,
  otp: String,
  createdAt: {
    type: Date,
    expires: 190, // 180s = 3min + 10s delay
  },
});

const PendingUserModel = mongoose.models.PendingUser || mongoose.model<IPendingUser>("PendingUser", PendingUserSchema);

export default PendingUserModel;
