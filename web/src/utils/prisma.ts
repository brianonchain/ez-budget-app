// This file creates a Prisma Client and attaches it to the global object so that only one instance of the client is created in your application.

import { PrismaClient } from "../generated/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
