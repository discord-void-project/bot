import prisma from '@/database/db'

async function findMany(guildId: string, type: any) {
    const records = await prisma.guildIgnoredChannel.findMany({
        where: { guildId, type },
        select: { channelId: true }
    })

    return records.map((r: any) => r.channelId)
}

async function add(guildId: string, channelId: string, type: any) {
    return await prisma.guildIgnoredChannel.upsert({
        where: {
            guildId_channelId: { guildId, channelId }
        },
        update: { type },
        create: { guildId, channelId, type }
    })
}

async function remove(guildId: string, channelId: string, type: any) {
    const record = await prisma.guildIgnoredChannel.findUnique({
        where: {
            guildId_channelId: { guildId, channelId },
            type
        }
    })

    if (!record) return

    await prisma.guildIgnoredChannel.delete({
        where: {
            guildId_channelId: { guildId, channelId },
            type
        }
    })
}

async function clear(guildId: string, type?: any) {
    if (type) {
        await prisma.guildIgnoredChannel.deleteMany({ where: { guildId, type } })
    } else {
        await prisma.guildIgnoredChannel.deleteMany({ where: { guildId } })
    }
}

const has = async (guildId: string, type: any, channelId: string) => {
    const channels = await findMany(guildId, type);
    return channels.includes(channelId);
}

export const guildIgnoredChannelService = {
    findMany,
    add,
    remove,
    clear,
    has
}
