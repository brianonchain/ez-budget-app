import mongoose, { Schema } from "mongoose";

const PendingUserSchema = new Schema(
  {
    email: { type: String, required: true, index: true, unique: true },
    hashedPassword: { type: String, required: true },
    hashedOtp: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    docExpiresAt: { type: Date, required: true }, // TTL field
  },
  { timestamps: true }
);

// delete doc when docExpiresAt is reached
PendingUserSchema.index({ docExpiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PendingUser || mongoose.model("PendingUser", PendingUserSchema);
