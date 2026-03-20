import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import PendingUserModel from "@/db/PendingUserModel";
import bcrypt from "bcryptjs";
import type { Account, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { normalizeEmail } from "@/utils/functions";
import { hashOtp } from "@/utils/serverFunctions";
import { Types } from "mongoose";
import MembershipModel from "@/db/MembershipModel";
import WorkspaceModel from "@/db/WorkspaceModel";
import { serverEnv } from "@/utils/serverEnv";

async function ensurePersonalWorkspace(userId: Types.ObjectId, email: string) {
  // Find any membership
  const existing = await MembershipModel.findOne({ userId }).lean<{ workspaceId: Types.ObjectId }>();
  if (existing) return existing.workspaceId;
  // Create workspace
  const ws = await WorkspaceModel.create({
    name: "Personal",
    ownerId: userId,
    ownerEmail: email,
    defaultCurrency: "USD",
    categoryObjects: [{ category: "none", subcategories: ["none"] }],
    tags: ["none"],
    discretionaryBudget: {
      amount: 0,
      currency: "USD",
      categoryObjects: [{ category: "none", subcategories: ["all"] }],
    },
  });
  // Create membership
  await MembershipModel.create({ userId, workspaceId: ws._id, role: "owner" });
  // Set active workspace to above workspace
  await UserModel.updateOne({ _id: userId }, { $set: { activeWorkspaceId: ws._id } });
  return ws._id;
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: serverEnv.GOOGLE_ID ?? "",
      clientSecret: serverEnv.GOOGLE_SECRET ?? "",
      authorization: { params: { prompt: "select_account" } }, // allows user to choose Google account
    }),
    CredentialsProvider({
      name: "Email/Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null; // frontend should prevent this case from happening. Null will rerturn res.error = "CredentialsSignin"
        const email = normalizeEmail(String(credentials.email || ""));
        await dbConnect();

        // IF OTP (verify + create user)
        if (credentials.otp) {
          const hashedOtp = hashOtp(credentials.otp);
          const pending = await PendingUserModel.findOneAndDelete({ email, hashedOtp, otpExpiresAt: { $gt: new Date() } });
          if (!pending) return null;
          // create user with findOneAndUpdate + upsert true + setOnInsert, this atomically checks if user exists and create if not, thus avoiding race conditions (if UserModel.create is called twice)
          const user = await UserModel.findOneAndUpdate(
            { email },
            { $setOnInsert: { email, hashedPassword: pending.hashedPassword, activeWorkspaceId: null } }, // $setOnInsert -- updates fields only if new doc is inserted. If doc exists, then no updates made
            { upsert: true, new: true, setDefaultsOnInsert: true } // this means if doc, then update; if no doc, then insert new
          );
          await ensurePersonalWorkspace(user._id as Types.ObjectId, email);
          return { id: user._id.toString(), email: user.email };
        }

        // IF PASSWORD
        if (!credentials.password) return null;
        const user = await UserModel.findOne({ email });
        if (!user || !user.hashedPassword) return null;
        const ok = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!ok) return null;
        return { id: user._id.toString(), email: user.email };
      },
    }),
  ],
  pages: {
    signIn: "/login", // if failed credential or not logged in, user is redirected to login page
    signOut: "/login", // if user is logged out, user is redirected to login page
    error: "/login", // if error occurs, user is redirected to login page
  },
  secret: serverEnv.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }: { user: User }) {
      if (!user.email) return false;
      const email = normalizeEmail(user.email);
      await dbConnect();
      const userDoc = await UserModel.findOneAndUpdate(
        { email },
        { $setOnInsert: { email, hashedPassword: "", activeWorkspaceId: null } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      await ensurePersonalWorkspace(userDoc._id as Types.ObjectId, email);
      return true;
    },
    async jwt({ token, account, user }: { token: JWT; account: Account | null; user?: any }) {
      if (account) token.provider = account.provider;
      if (token.email && !token.userId) {
        await dbConnect();
        const userDoc = await UserModel.findOne({ email: token.email }).select("_id").lean<{ _id: Types.ObjectId } | null>();
        if (userDoc) token.userId = userDoc._id.toString();
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      // expose safe ids to client
      (session as any).userId = token.userId;
      (session as any).provider = token.provider;
      return session;
    },
  },
};
