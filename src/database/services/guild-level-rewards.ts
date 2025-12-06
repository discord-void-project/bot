import prisma from '@/database/db'

async function findMany(guildId: string) {
    return await prisma.guildLevelReward.findMany({
        where: { guildId },
        select: {
            atLevel: true,
            roleId: true,
            coinsReward: true
        },
        orderBy: { atLevel: 'asc' }
    })
}

async function addOrUpdate(guildId: string, atLevel: number, data: {
    roleId?: string | null
    coinsReward?: number | null
}) {
    return await prisma.guildLevelReward.upsert({
        where: {
            guildId_atLevel: { guildId, atLevel }
        },
        update: data,
        create: { guildId, atLevel, ...data }
    })
}

async function remove(guildId: string, atLevel: number) {
    return await prisma.guildLevelReward.delete({
        where: {
            guildId_atLevel: { guildId, atLevel }
        }
    });
}

async function clear(guildId: string) {
    return await prisma.guildLevelReward.deleteMany({ where: { guildId } })
}

export const guildLevelRewardService = {
    findMany,
    addOrUpdate,
    remove,
    clear
}
