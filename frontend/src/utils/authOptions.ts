import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import bcrypt from "bcryptjs";
import type { Account, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { normalizeEmail } from "@/utils/functions";
import { hashOtp } from "@/utils/serverFunctions";
import PendingUserModel from "@/db/PendingUserModel";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
      authorization: {
        params: {
          prompt: "select_account", // this is needed for user to choose Google account
        },
      },
    }),
    CredentialsProvider({
      name: "Email/Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        console.log("authOptions.ts, authorize");
        if (!credentials?.email) return null; // frontend should prevent this case from happening. Null will rerturn res.error = "CredentialsSignin"
        const _email = normalizeEmail(String(credentials.email || ""));
        await dbConnect();

        // IF OTP
        if (credentials.otp) {
          const hashedOtp = hashOtp(credentials.otp);
          // atomic verify + consume
          const pendingUserDoc = await PendingUserModel.findOneAndDelete({
            email: _email,
            hashedOtp: hashedOtp,
            otpExpiresAt: { $gt: new Date() }, // OTP must not be expired
          });

          // use findOneAndUpdate, upsert true, and setOnInsert to avoid race conditions (if UserModel.create is called twice)
          // $setOnInsert updates fields only if new doc is inserted. If doc already exists, then no updates will happen.
          // don't check check if User exists, then create it (will cause race conditions)
          if (pendingUserDoc) {
            const userDoc = await UserModel.findOneAndUpdate(
              { "settings.email": _email },
              {
                $setOnInsert: {
                  hashedPassword: pendingUserDoc.hashedPassword,
                  "settings.email": _email,
                  "settings.defaultCurrency": "USD",
                  "settings.categoryObjects": [{ category: "none", subcategories: ["none"] }],
                  "settings.tags": ["none"],
                  items: [],
                },
              },
              { upsert: true, new: true, setDefaultsOnInsert: true } // this means update or insert (if doc, then update; if no doc, then insert new)
            );
            return { id: userDoc._id.toString(), email: _email };
          }

          return null;
        }

        // IF PASSWORD
        if (!credentials.password) return null;
        const userDoc = await UserModel.findOne({ "settings.email": _email });
        if (!userDoc) return null;
        const isPasswordValid = await bcrypt.compare(credentials.password, userDoc.hashedPassword);
        if (!isPasswordValid) return null;
        return { id: userDoc._id.toString(), email: userDoc.settings.email };
      },
    }),
  ],
  pages: {
    signIn: "/login", // if failed credential or not logged in, user is redirected to login page
    signOut: "/login", // if user is logged out, user is redirected to login page
    error: "/login", // if error occurs, user is redirected to login page
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }: { user: User }) {
      console.log("authOptions.ts, signIn");
      if (!user.email) return false;
      try {
        await dbConnect();
        await UserModel.updateOne(
          { "settings.email": user.email },
          {
            $setOnInsert: {
              hashedPassword: "",
              "settings.email": user.email,
              "settings.defaultCurrency": "USD",
              "settings.categoryObjects": [{ category: "none", subcategories: ["none"] }],
              "settings.tags": ["none"],
              items: [],
            },
          },
          { upsert: true, setDefaultsOnInsert: true }
        );
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    },
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account) token.provider = account.provider;
      return token;
    }, // TODO: edit session to look like jwt
    session: ({ session, token }: { session: Session; token: JWT }) => {
      if (token.provider) session.provider = token.provider as string;
      return session;
    },
  },
};
