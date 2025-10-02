import { Prisma } from '@prisma/client'
import prisma from '@/database/prisma'

const find = async (
    userId: string,
    guildId: string,
) => {
    return await prisma.member.findUnique({
        where: {
            userId_guildId: {
                userId,
                guildId
            }
        }
    });
}

const findOrCreate = async (
    userId: string,
    guildId: string
) => {
    const [user, guild, member] = await prisma.$transaction([
        prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId },
        }),
        prisma.guild.upsert({
            where: { id: guildId },
            update: {},
            create: { id: guildId },
        }),
        prisma.member.upsert({
            where: { userId_guildId: { userId, guildId } },
            update: {},
            create: { userId, guildId },
        }),
    ]);

    return { user, guild, member };
};

const updateOrCreate = async (
    userId: string,
    guildId: string,
    data: {
        update: Prisma.MemberUpdateInput;
        create?: Omit<Prisma.MemberCreateInput, 'user' | 'guild'>;
    }
) => {
    const member = await prisma.member.upsert({
        where: {
            userId_guildId: { userId, guildId },
        },
        update: data.update,
        create: {
            user: {
                connectOrCreate: {
                    create: { id: userId },
                    where: { id: userId }
                }
            },
            guild: {
                connectOrCreate: {
                    create: { id: guildId },
                    where: { id: guildId }
                }
            },
            ...(data.create ?? {}),
        },
    });

    return member;
}

const remove = async (userId: string, guildId: string) => {
    return await prisma.member.delete({
        where: {
            userId_guildId: { userId, guildId }
        }
    });
}

const pay = async (
    userId: string,
    guildId: string,
    amount: number,
    options: { coins?: boolean; bank?: boolean } = { coins: true }
) => {
    const useCoins = options.coins ?? true;
    const useBank = options.bank ?? false;

    const { member } = await findOrCreate(userId, guildId);

    let remaining = amount;

    let coins = member.coins ?? 0;
    let bank = member.bank ?? 0;

    if (useCoins && coins >= remaining) {
        coins -= remaining;
        remaining = 0;
    } else if (useCoins && useBank) {
        if (coins >= remaining) {
            coins -= remaining;
            remaining = 0;
        } else {
            remaining -= coins;
            coins = 0;

            if (bank >= remaining) {
                bank -= remaining;
                remaining = 0;
            } else {
                throw new Error('Not enough funds in coins and bank');
            }
        }
    } else if (useCoins && coins < remaining) {
        throw new Error('Not enough coins');
    } else if (!useCoins && useBank) {
        if (bank >= remaining) {
            bank -= remaining;
            remaining = 0;
        } else {
            throw new Error('Not enough bank funds');
        }
    } else {
        throw new Error('No payment method specified');
    }

    if (remaining > 0) {
        throw new Error('Not enough funds to pay');
    }

    const updatedMember = await updateOrCreate(userId, guildId, {
        update: {
            coins,
            bank,
        },
    });

    return updatedMember;
};

export const memberService = {
    find,
    updateOrCreate,
    findOrCreate,
    remove,
    pay
}