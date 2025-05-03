// import NextAuth from "next-auth";
// import { DefaultJWT } from "@auth/core/jwt";

// declare module "next-auth" {
//   // Extend session to hold the access_token
//   interface Session {
//     provider?: string;
//   }

//   // Extend token to hold the access_token before it gets put into session
//   interface JWT {
//     provider?: string & DefaultJWT;
//   }
// }

import NextAuth from "next-auth";
import { DefaultJWT } from "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    provider: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider: string;
  }
}
