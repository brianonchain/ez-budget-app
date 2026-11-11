import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";

async function run() {
  const { default: WorkspaceModel } = await import("@/db/WorkspaceModel");
  const { default: dbConnect } = await import("@/db/dbConnect");

  await dbConnect();

  const workspaces = await WorkspaceModel.find({}).lean();

  for (const workspace of workspaces) {
    const newCategoryObjects = (workspace.categoryObjects || []).map((obj: any) => ({
      category: obj.category,
      subcategories: ["all"], // 🔥 force to ["all"]
    }));

    await WorkspaceModel.updateOne(
      { _id: workspace._id },
      {
        $set: {
          "discretionaryBudget.categoryObjects": newCategoryObjects,
        },
      }
    );
  }

  console.log("Migration finished");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
