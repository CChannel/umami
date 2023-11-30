import prisma from 'lib/prisma';

export async function getWebsiteByShareId(share_id) {
  return prisma.roClient.website.findUnique({
    where: {
      share_id,
    },
  });
}
