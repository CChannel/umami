import prisma from 'lib/prisma';

export async function getAccountById(user_id) {
  return prisma.roClient.account.findUnique({
    where: {
      user_id,
    },
  });
}
