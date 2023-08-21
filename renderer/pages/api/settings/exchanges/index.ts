import { revalidate } from '../../utils/revalidate';
import { prisma } from "@/db";
import { NextApiRequest, NextApiResponse } from 'next';
import { Exchange } from "@prisma/client";

function parseCredentials(exchange: Exchange) {
  return { ...exchange, credentials: JSON.parse(exchange.credentials) }
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'GET') {
    try {
      const exchanges = await prisma.exchange.findMany();

      const parsedExchanges = exchanges.map(parseCredentials);
      console.log('EXCHANGES', parsedExchanges);
      return res.json(parsedExchanges);
    } catch (e) {
      return res.status(500).end();
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'POST') {
    try {
      const exchanges = req.body as Exchange[];
      console.log(exchanges);

      revalidate(req, 'exchange');

      const newValues = [];
      for (const exchange of exchanges) {
        let newValue;
        if (exchange.id) {
          newValue = await prisma.exchange.update({
            where: { id: exchange.id },
            data: {
              name: exchange.name,
              url: exchange.url,
              credentials: JSON.stringify(exchange.credentials || {}),
            },
          });
        } else {
          newValue = await prisma.exchange.create({
            data: { ...exchange, credentials: JSON.stringify(exchange.credentials || {}) },
          });
        }

        newValues.push(parseCredentials(newValue));
      }

      console.log('EXCHANGES', newValues);
      return res.json(newValues);
    } catch (e) {
      console.log(e);
      return res.status(500).end();
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).end(); // Method not allowed
  }
}