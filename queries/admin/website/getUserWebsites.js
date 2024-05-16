import prisma from 'lib/prisma';

export async function getUserWebsites(user_id) {
  return prisma.roClient.website.findMany({
    where: {
      user_id,
    },
    orderBy: {
      name: 'asc',
    },
  });
}
