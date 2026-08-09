// Qawla — Database client
//
// Prisma is not currently a runtime dependency (the app uses Firestore in
// production and mock data in development). This module is kept as a
// placeholder so future routes that need a SQL database can import `db`
// without scaffolding. When you're ready to use Prisma:
//   1. `bun add @prisma/client && bun add -d prisma`
//   2. Run `bunx prisma generate`
//   3. Restore the original PrismaClient instantiation below.

export interface DbClient {
  // Placeholder — add typed table accessors here once Prisma is wired up.
}

/**
 * No-op database client. Returns null in the current build so that any
 * (currently unused) import of `db` does not pull in @prisma/client.
 * Replace with a real PrismaClient once the database is provisioned.
 */
export const db: DbClient | null = null;

declare global {
  // eslint-disable-next-line no-var
  var prisma: DbClient | null | undefined;
}

if (process.env.NODE_ENV !== 'production' && !globalThis.prisma) {
  globalThis.prisma = db;
}
