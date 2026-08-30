import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export const db = {
  query: async <T = any>(text: string, params?: unknown[]): Promise<QueryResult<T>> => {
    const rows = await prisma.$queryRawUnsafe<T>(text, ...(params || []));
    return { rows: rows as T[], rowCount: (rows as T[]).length };
  },
  closePool: async () => {
    await prisma.$disconnect();
  },
};

export const closePool = db.closePool;