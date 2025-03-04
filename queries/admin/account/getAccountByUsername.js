import prisma from 'lib/prisma';

export async function getAccountByUsername(username) {
  return prisma.roClient.account.findUnique({
    where: {
      username,
    },
  });
}
