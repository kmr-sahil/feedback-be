import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function getResponseStats(projectId: string) {
  const responseStats = await prisma.response.groupBy({
    by: ['type'],
    where: {
      projectId: projectId,
    },
    _count: {
      _all: true, // Count total responses
    },
  });

  console.log(responseStats)

  // Calculate total responses
  const totalResponses = responseStats.reduce((acc, stat) => acc + stat._count._all, 0);

  // Extract counts for specific types
  const suggestionCount = responseStats.find(stat => stat.type === 'Suggestion')?._count._all || 0;
  const issueCount = responseStats.find(stat => stat.type === 'Issue')?._count._all || 0;
  const likedCount = responseStats.find(stat => stat.type === 'Liked')?._count._all || 0;

  return {
    totalResponses,
    suggestionCount,
    issueCount,
    likedCount,
  };
}
