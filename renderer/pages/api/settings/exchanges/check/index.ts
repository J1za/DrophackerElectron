import { getHeaders } from '@/providers/methods/CEX/okex/utils/getHeader';
import { EStatuses, IExchange } from '@/types';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('GET:::CHECK');
    return res.status(200).end();
  } else if (req.method === 'POST') {
    try {
      console.log('CHECK::POST');
      const exchange = req.body as IExchange;

      const endpoint = '/api/v5/asset/deposit-address?ccy=ETH';
      const { apiKey, passphrase, secretKey } = exchange.credentials;

      const headers = getHeaders({
        apiKey: apiKey!,
        passphrase: passphrase!,
        secretKey: secretKey!,
        endpoint,
        method: 'GET',
      });

      const axiosConfig = {
        headers,
      };

      const response = await axios.get(exchange.url + endpoint, axiosConfig);

      return res.json({ status: EStatuses.SUCCESS, data: response.data });
    } catch (e) {
      console.log('FAILED TO CHECK EXCHANGE');
      return res.json({ status: EStatuses.FAILED });
    }
  } else {
    return res.status(405).end(); // Method not allowed
  }
}
