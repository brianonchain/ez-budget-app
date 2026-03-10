import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";

async function run() {
  const { default: WorkspaceModel } = await import("@/db/WorkspaceModel");
  const { default: UserModel } = await import("@/db/UserModel");
  const { default: dbConnect } = await import("@/db/dbConnect");

  await dbConnect();

  const workspaces = await WorkspaceModel.find({ ownerEmail: { $exists: false } }).select("_id ownerId");

  console.log(`Found ${workspaces.length} workspaces to update`);

  for (const ws of workspaces) {
    const user = await UserModel.findById(ws.ownerId).select("email").lean<{ email: string } | null>();

    if (!user) {
      console.log(`⚠️ No user found for workspace ${ws._id}`);
      continue;
    }

    await WorkspaceModel.updateOne({ _id: ws._id }, { $set: { ownerEmail: user.email } });

    console.log(`✔ Updated workspace ${ws._id}`);
  }

  console.log("Migration finished");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
