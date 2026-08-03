import { prisma } from "@/lib/prisma";

export function getRecentPosts(limit = 3) {
  return prisma.post.findMany({
    orderBy: { date: "desc" },
    take: limit,
  });
}
