import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    userId?: string;
    provider?: string;
    user: DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    provider?: string;
  }
}
