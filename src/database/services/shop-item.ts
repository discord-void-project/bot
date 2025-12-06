import prisma from '@/database/db'

async function findMany(guildId: string) {
    return await prisma.shopItem.findMany({
        where: { guildId },
        orderBy: { cost: 'asc' }
    });
}

async function create(guildId: string, data: {
    cost: number;
    stock?: number;
    roleId: string;
}) {
    return await prisma.shopItem.create({
        data: {
            guildId,
            cost: data.cost,
            roleId: data.roleId,
            stock: data.stock
        }
    });
}

async function update(itemId: number, data: {
    label?: string;
    cost?: number;
    stock?: number;
    roleId?: string;
}) {
     await prisma.shopItem.update({
        where: { id: itemId },
        data
    });
}

async function remove(itemId: number) {
    return await prisma.shopItem.delete({
        where: { id: itemId }
    })
}

async function clear(guildId: string) {
   return await prisma.shopItem.deleteMany({ where: { guildId } })
}

export const shopItemService = {
    findMany,
    create,
    update,
    remove,
    clear
}
