import { prisma } from '@/db';
import { IAccountGroup } from '@/types';
import { getErrorMessage } from '@/utils/getErrorMessage';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { id, accounts = [] } = req.body as IAccountGroup;

            let deletedGroup = {};
            if (id) {
                deletedGroup = await prisma.accountsGroup.delete({
                    where: {
                        id
                    }
                });
            }

            const deletedAccounts = [];
            for (const account of accounts) {
                if (account.id) {
                    const del = await prisma.account.delete({
                        where: {
                            id: account.id
                        }
                    });
                    if (del.id) {
                        deletedAccounts.push(del);
                    }
                }
            }

            return res.status(200).json({ ...deletedGroup, accounts: deletedAccounts });
        } catch (e) {
            const errMessage = getErrorMessage(e);
            console.log('ERR\t:::: \t', errMessage);
            return res.status(500).send();
        } finally {
            await prisma.$disconnect();
        }
    } else {
        return res.status(405).send();
    }
}
