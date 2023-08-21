import { prisma } from '@/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const groups = await prisma.accountsGroup.findMany();

      return res.status(200).json(groups);
    } catch (e) {
      return res.status(500).send();
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).send();
  }
}