import mongoose, { Schema, Types, model, models } from "mongoose";

export interface IPushSubscription {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  deviceName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", index: true }, // Optional: useful if notification settings are workspace-specific, if subscriptions are global per user/device, you can remove this.
    endpoint: { type: String, required: true, unique: true }, // Unique browser push endpoint.
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String }, // Optional metadata, helpful for debugging/device management.
    deviceName: { type: String },
  },
  {
    timestamps: true,
  },
);

// Fast lookup when notifying a workspace's members
PushSubscriptionSchema.index({ userId: 1, workspaceId: 1 });

// Optional: if you want one subscription endpoint per user only
PushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

const PushSubscriptionModel = models.PushSubscription || model<IPushSubscription>("PushSubscription", PushSubscriptionSchema);

export default PushSubscriptionModel;
