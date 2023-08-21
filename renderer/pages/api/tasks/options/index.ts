import { NextApiRequest, NextApiResponse } from 'next';
import { taskOptions } from '@/public/taskOptions';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    try {
        if (_req.method === 'GET') {
            res.status(200).json(taskOptions);
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({
            error: 'An error occurred',
        });
    }
}