import { Prisma } from '@prisma/client'

import prisma from '@/database/prisma'
import { UserFlagsString } from '../utils/UserFlags'
import { dateElapsedRatio } from '@/utils';

const find = async (userId: string) => {
    return await prisma.user.findUnique({
        where: { id: userId }
    });
}

const update = async (userId: string, data: Prisma.UserUpdateInput) => {
    return await prisma.user.update({
        where: { id: userId },
        data
    });
}

const findOrCreate = async (userId: string) => {
    return await prisma.user.upsert({
        where: { id: userId },
        create: { id: userId },
        update: {},
    });
}

const addFlag = async (userId: string, flag: UserFlagsString) => {
    const user = await findOrCreate(userId);

    return await update(userId, {
        flags: user.flags.add(flag).bitfield
    });
}

const removeFlag = async (userId: string, flag: UserFlagsString) => {
    const user = await findOrCreate(userId);

    return await prisma.user.update({
        where: { id: userId },
        data: {
            flags: user.flags.remove(flag).bitfield
        }
    });
}

const resetTagAssignedAt = async (userId: string) => {
    return await prisma.user.upsert({
        where: { id: userId },
        update: { tagAssignedAt: null },
        create: { id: userId, tagAssignedAt: null }
    });
}

const setTagAssignedAt = async (userId: string, date?: Date) => {
    date ??= new Date();

    return await prisma.user.upsert({
        where: { id: userId },
        update: { tagAssignedAt: date },
        create: { id: userId, tagAssignedAt: date }
    });
}

const getTagBoost = async (userId: string, minDays?: number): Promise<number> => {
    const user = await userService.find(userId);

    if (!user?.tagAssignedAt) return 0;

    return dateElapsedRatio(user.tagAssignedAt, minDays ?? 14)
}

export const userService = {
    find,
    update,
    findOrCreate,
    addFlag,
    removeFlag,
    resetTagAssignedAt,
    setTagAssignedAt,
    getTagBoost
}