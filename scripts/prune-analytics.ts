import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// /api/track é público e escreve em AnalyticsEvent a cada pageview/clique —
// sem retenção a tabela (e seus índices) cresce sem limite. Rodar via cron
// na VM (ver README, seção "Deploy em produção"), fora do processo do
// Next, por isso a instância própria de PrismaClient (mesmo padrão do
// prisma/seed.ts).
const RETENTION_DAYS = Number(process.env.ANALYTICS_RETENTION_DAYS ?? 180);

async function main() {
  if (!Number.isFinite(RETENTION_DAYS) || RETENTION_DAYS <= 0) {
    throw new Error(`ANALYTICS_RETENTION_DAYS inválido: ${process.env.ANALYTICS_RETENTION_DAYS}`);
  }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const { count } = await prisma.analyticsEvent.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  console.log(`[prune-analytics] ${count} evento(s) anteriores a ${cutoff.toISOString()} removidos.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
