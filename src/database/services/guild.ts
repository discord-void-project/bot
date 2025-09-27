import { BlacklistStatus, Prisma } from '@prisma/client'
import prisma from '@/database/prisma'

const findUser = async (userId: string) => {
    return await prisma.blacklist.findUnique({
        where: { userId }
    });
}

const addBlacklist = async (options: Prisma.BlacklistUncheckedCreateInput) => {
    const { userId, modId, ...data } = options;

    return await prisma.blacklist.upsert({
        where: { userId },
        create: {
            ...data,
            user: {
                connectOrCreate: {
                    where: { id: userId },
                    create: { id: userId }
                }
            },
            mod: {
                connectOrCreate: {
                    where: { id: modId },
                    create: { id: modId }
                }
            },
        },
        update: {},
        include: {
            mod: true,
            user: true,
        }
    });
}

const removeBlacklist = async (userId: string) => {
    const user = await findUser(userId);
    if (user) {
        return await prisma.blacklist.delete({
            where: { userId }
        });
    }

    return null;
}

const updateBlacklistStatus = async (userId: string, status: BlacklistStatus) => {
    return await prisma.blacklist.update({
        where: { userId },
        data: { status }
    });
}

const findUserGuildBlacklist = async (guildId: string, userId: string) => {
    return await prisma.blacklistGuild.findUnique({
        where: { guildId, userId },
        include: {
            user: {
                select: {
                    reason: true,
                    blacklistAt: true,
                }
            }
        }
    });
}

const authorizeUserGuildBlacklist = async (guildId: string, userId: string) => {
    const blacklist = await findUser(userId);
    if (!blacklist) return null;

    let guildBlacklist = await findUserGuildBlacklist(guildId, userId);
    if (guildBlacklist) return guildBlacklist;
    
    return await prisma.blacklistGuild.create({
        data: {
            accepted: true,
            guild: {
                connect: {
                    id: guildId
                }
            },
            user: {
                connect: { userId }
            }
        },
        include: {
            user: {
                select: {
                    reason: true,
                    blacklistAt: true,
                }
            }
        }
    });
}

const unauthorizeUserGuildBlacklist = async (guildId: string, userId: string) => {
    let guildBlacklist = await findUserGuildBlacklist(guildId, userId);
    if (guildBlacklist) {
        const data = await prisma.blacklistGuild.delete({
            where: { userId, guildId }
        });

        return {
            ...data,
            accepted: false
        }
    }
}

export const guildService = {
    findUser,
    addBlacklist,
    removeBlacklist,
    updateBlacklistStatus,
    findUserGuildBlacklist,
    authorizeUserGuildBlacklist,
    unauthorizeUserGuildBlacklist
}
