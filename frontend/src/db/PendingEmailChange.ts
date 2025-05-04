import mongoose, { Document, Schema } from "mongoose";

export interface IPendingEmailChange extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const PendingEmailChangeSchema: Schema = new Schema<IPendingEmailChange>({
  email: String,
  otp: String,
  createdAt: {
    type: Date,
    expires: 130, // 120s = 2min + 10s delay
  },
});

const PendingEmailChangeModel = mongoose.models.PendingEmailChange || mongoose.model<IPendingEmailChange>("PendingEmailChange", PendingEmailChangeSchema);

export default PendingEmailChangeModel;
