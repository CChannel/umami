import prisma from 'lib/prisma';

export async function getWebsiteById(website_id) {
  return prisma.roClient.website.findUnique({
    where: {
      website_id,
    },
  });
}
