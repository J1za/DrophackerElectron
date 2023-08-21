import { Account, AccountsGroup } from '@prisma/client';
import { IAccountGroup } from '@/types';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { prisma } from '@/db';
import { handleApiErrorMessage } from '../utils/apiErrorMessage';

const tag = 'accounts';

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'GET') {
        try {
            const groups = await prisma.accountsGroup.findMany({
                include: {
                    accounts: true,
                },
                orderBy: {
                    // created_at: 'desc',
                },
            });

            return res.status(200).json(groups);
        } catch (e) {
            return res.status(500).send();
        } finally {
            await prisma.$disconnect();
        }
    } else if (method === 'POST') {
        try {
            const { id, name, accounts = [] } = req.body as IAccountGroup;

            const uniqueAccounts: Record<string, Account> = {};
            for (const acc of accounts) {
                const uniqueAcc = uniqueAccounts?.[acc.address];
                if (uniqueAcc) {
                    throw new Error(`Duplicated accounts: ${uniqueAcc.name} and ${acc.name}. Have the same address: ${acc.address}`);
                } else {
                    uniqueAccounts[acc.address] = acc;
                }

                const dbAcc = await prisma.account.findFirst({
                    where: { address: acc.address },
                    select: { group: true, name: true, address: true },
                });
                if (dbAcc) {
                    throw new Error(`Account ${acc.address} already exists in group '${dbAcc.group?.name}' with name '${dbAcc.name}'`);
                }
            }

            let group: AccountsGroup | { id: string | undefined } = { id: undefined };
            if (!id) {
                group = await prisma.accountsGroup.create({
                    data: {
                        name,
                    },
                });
            } else {
                group.id = id;
            }

            const newAccounts = [];
            if (!group.id) {
                throw new Error(
                    "In order to create accounts, need group name to create group, or group Id to connect account to group"
                );
            }
            for (const account of accounts) {
                try {
                    const newAcc = await prisma.account.create({
                        data: {
                            ...account,
                            groupId: group.id,
                        },
                    });
                    newAccounts.push(newAcc);
                } catch (e) { }
            }

            return res.status(200).json({ ...group, accounts: newAccounts });
        } catch (e) {
            return res.status(500).json(handleApiErrorMessage(e));
        } finally {
            await prisma.$disconnect();
        }
    } else if (method === 'PUT') {
        try {
            const { id, name, accounts = [] } = req.body as IAccountGroup;

            let updatedGroup: AccountsGroup;
            if (id && name) {
                updatedGroup = await prisma.accountsGroup.update({
                    where: {
                        id,
                    },
                    data: {
                        name,
                    },
                });
                if (!updatedGroup.id) {
                    throw new Error("Invalid group Id");
                }
                return res.status(200).json(updatedGroup);
            }

            if (accounts) {
                const updatedAccounts = [];
                for (const account of accounts) {
                    if (account.id) {
                        const updatedAcc = await prisma.account.update({
                            where: {
                                id: account.id,
                            },
                            data: {
                                name: account.name,
                            },
                        });
                        if (updatedAcc.id) {
                            updatedAccounts.push(updatedAcc);
                        }
                    }
                }
                return res.status(200).json({ accounts: updatedAccounts });
            }

            throw new Error("Need to provide [id: groupId, name: groupName] or [{accounts: Array<{id, name}>}]");
        } catch (e) {
            console.log(e);
            return res.status(500).send();
        } finally {
            await prisma.$disconnect();
        }
    } else if (method === 'DELETE') {
        try {
            const { id, accounts = [] } = req.body as IAccountGroup;
            let deletedGroup = {};
            if (id) {
                deletedGroup = await prisma.accountsGroup.delete({
                    where: {
                        id,
                    },
                });
            }

            const deletedAccounts = [];
            for (const account of accounts) {
                if (account.id) {
                    const del = await prisma.account.delete({
                        where: {
                            id: account.id,
                        },
                    });
                    if (del.id) {
                        deletedAccounts.push(del);
                    }
                }
            }

            return res.status(200).json({ ...deletedGroup, accounts: deletedAccounts });
        } catch (e) {
            const errMessage = getErrorMessage(e);
            console.log("ERR\t:::: \t", errMessage);
            return res.status(500).send();
        } finally {
            await prisma.$disconnect();
        }
    } else {
        return res.status(405).send();
    }
}
