import { readReplicas } from "@prisma/extension-read-replicas";

import { env } from "../env";
import { PrismaClient } from "./generated/client";

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends(
    readReplicas({
      url: env.DRIVER_POSTGRES_READ_REPLICA_URLS,
    }),
  );

const globalForPrisma = globalThis as unknown as {
  driverDb: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.driverDb ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.driverDb = db;

export type IPrismaClient = ReturnType<typeof createPrismaClient>;
