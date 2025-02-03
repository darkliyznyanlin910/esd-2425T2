import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "db-user"; // Ensure @db-user exports the Prisma client

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql", // Specify PostgreSQL as the provider
    }),
    emailAndPassword: {  
        enabled: true
    },
});