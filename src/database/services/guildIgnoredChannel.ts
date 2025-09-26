import { IgnoredType } from '@prisma/client'
import prisma from '@/database/prisma'

async function findMany(guildId: string, type: IgnoredType) {
    const records = await prisma.guildIgnoredChannel.findMany({
        where: { guildId, type },
        select: { channelId: true }
    })

    return records.map((r: any) => r.channelId)
}

async function add(guildId: string, channelId: string, type: IgnoredType) {
    return await prisma.guildIgnoredChannel.upsert({
        where: {
            guildId_channelId: { guildId, channelId }
        },
        update: { type },
        create: { guildId, channelId, type }
    })
}

async function remove(guildId: string, channelId: string, type: IgnoredType) {
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

async function clear(guildId: string, type?: IgnoredType) {
    if (type) {
        await prisma.guildIgnoredChannel.deleteMany({ where: { guildId, type } })
    } else {
        await prisma.guildIgnoredChannel.deleteMany({ where: { guildId } })
    }
}

const has = async (guildId: string, type: IgnoredType, channelId: string) => {
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
