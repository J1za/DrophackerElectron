import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/db";
import { IProvider } from "@/types";
import { revalidate } from "../../utils/revalidate";
import { getErrorMessage } from "@/utils/getErrorMessage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'GET') {
    try {
      const providers = await prisma.provider.findMany();
      return res.json(providers);
    } catch (e) {
      console.log('ERROR IN GET - /api/settings/providers\n', e);
      console.log(getErrorMessage(e));
      return res.json([]);
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'POST') {
    try {
      console.log('PROVIDERS POST:');
      const providers = req.body as IProvider[];
      console.log(providers);

      const newProviders = [];
      for (const provider of providers) {
        let newProv;
        if (provider.id) {
          newProv = await prisma.provider.update({
            where: { id: provider.id },
            data: { url: provider.url, gasPrice: provider.gasPrice },
          });
        } else {
          newProv = await prisma.provider.create({
            data: { url: provider.url, chain: provider.chain },
          });
        }

        newProviders.push(newProv);
      }

      return res.json(newProviders);
    } catch (e) {
      console.log(e);
      return res.status(500).end();
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).end();
  }
}
