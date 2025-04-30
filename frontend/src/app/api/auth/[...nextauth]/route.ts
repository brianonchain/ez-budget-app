import NextAuth from "next-auth";
import type { User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Email/Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("Missing email or password");

        // 1. Get user from database
        await dbConnect();
        const doc = await UserModel.findOne({ "settings.email": credentials.email });
        if (!doc) throw new Error("User not found");

        // 2. Check password
        const isValid = await bcrypt.compare(credentials.password, doc.hashedPassword);
        if (!isValid) throw new Error("Invalid password");

        // 3. Return user object (only id/email/username)
        return { id: doc._id, email: doc.settings.email };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }: { user: User }) {
      if (!user.email) return false;
      try {
        await dbConnect();
        const doc = await UserModel.findOne({ "settings.email": user.email });
        // if no doc, create user
        if (!doc) {
          await UserModel.create({
            hashedPassword: "",
            settings: {
              email: user.email,
              currency: "",
              category: { none: ["none"] },
              tags: ["none"],
            },
            items: [],
          });
        }
        return true;
      } catch (e) {
        return false;
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
