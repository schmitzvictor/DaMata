import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Reuse the client across Next.js hot-reloads in dev to avoid exhausting
// Postgres connections.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// `new PrismaPg(...)` opens a pg.Pool immediately, so it must only run when
// actually constructing a client — building it unconditionally above the `??`
// created (and leaked) a fresh Postgres connection pool on every hot-reload
// even though the pool went unused whenever a cached client already existed.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
