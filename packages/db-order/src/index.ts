import { readReplicas } from "@prisma/extension-read-replicas";

import { env } from "../env";
import { PrismaClient } from "./generated/client";

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends(
    readReplicas({
      url: env.ORDER_POSTGRES_READ_REPLICA_URLS,
    }),
  );

const globalForPrisma = globalThis as unknown as {
  orderDb: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.orderDb ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.orderDb = db;

export type IPrismaClient = ReturnType<typeof createPrismaClient>;
