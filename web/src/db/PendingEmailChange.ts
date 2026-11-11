import mongoose, { Document, Schema } from "mongoose";

export interface IPendingEmailChange extends Document {
  oldEmail: string; // owner (current email)
  newEmail: string; // target email
  hashedOtp: string;
  otpExpiresAt: Date; // logical OTP expiry
  docExpiresAt: Date; // TTL cleanup
}

const PendingEmailChangeSchema = new Schema<IPendingEmailChange>({
  oldEmail: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  newEmail: {
    type: String,
    required: true,
    index: true,
  },
  hashedOtp: {
    type: String,
    required: true,
  },
  otpExpiresAt: {
    type: Date,
    required: true,
  },
  docExpiresAt: {
    type: Date,
    required: true,
  },
});

// TTL: delete doc when docExpiresAt is reached
PendingEmailChangeSchema.index({ docExpiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingEmailChangeModel =
  mongoose.models.PendingEmailChange || mongoose.model<IPendingEmailChange>("PendingEmailChange", PendingEmailChangeSchema);

export default PendingEmailChangeModel;
