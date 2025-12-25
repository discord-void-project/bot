import db from '@/database/db'

import {
    GuildCreateNestedOneWithoutItemsInput,
    ShopCreateNestedOneWithoutItemsInput,
    ShopItemCreateInput
} from '@/database/core/models'

interface ShopItemWhere {
    guildId: string;
    shopName: string;
    roleId: string;
}

type ShopItemCreateInputWithoutGuildAndRoleId = Omit<ShopItemCreateInput, 'guild' | 'roleId'>

class ShopItemService {
    constructor(public model: typeof db.shopItem) { }

    // -- Utils -- //
    private _buildWhere({ roleId, shopName, guildId }: ShopItemWhere) {
        return {
            shopName,
            guildId_roleId: {
                guildId,
                roleId
            }
        };
    }

    private _connectOrCreateGuildAndShop(where: ShopItemWhere) {
        const { guildId, shopName } = where;

        return {
            guild: {
                connectOrCreate: {
                    where: { id: guildId },
                    create: { id: guildId }
                }
            } as GuildCreateNestedOneWithoutItemsInput,
            shop: {
                connectOrCreate: {
                    where: {
                        guildId_name: {
                            guildId,
                            name: shopName
                        }
                    },
                    create: {
                        name: shopName
                    }
                }
            } as ShopCreateNestedOneWithoutItemsInput
        }
    }

    // -- CRUD -- //
    async all(where: { guildId: string; shopName: string; }) {
        return await this.model.findMany({
            where,
            orderBy: { cost: 'asc' }
        });
    }

    async allItems(guildId: string) {
        return await this.model.findMany({
            where: { guildId },
            orderBy: { cost: 'asc' }
        });
    }

    async addOrUpdate(where: ShopItemWhere, data: Partial<ShopItemCreateInputWithoutGuildAndRoleId> & { cost: number }) {
        return await this.model.upsert({
            where: this._buildWhere(where),
            update: data,
            create: {
                ...data,
                roleId: where.roleId,
                ...this._connectOrCreateGuildAndShop(where)
            }
        });
    }

    async remove(where: ShopItemWhere) {
        return await this.model.delete({
            where: this._buildWhere(where)
        });
    }

    async clear(guildId: string) {
        return await this.model.deleteMany({
            where: { guildId }
        });
    }

    async restock(where: ShopItemWhere, amount: number) {
        return await this.model.update({
            where: this._buildWhere(where),
            data: {
                stock: {
                    increment: amount
                }
            }
        });
    }

    async decrementStock(where: ShopItemWhere, amount = 1) {
        const item = await this.model.findUnique({
            where: this._buildWhere(where),
        });

        if (!item) {
            throw new Error(`Cet item n'existe pas`);
        }

        if (typeof item.stock !== 'number') {
            throw new Error('Cet item ne possède pas de stock');
        }

        if (item.stock < amount) {
            throw new Error('Stock insuffisant');
        }

        return await this.model.update({
            where: this._buildWhere(where),
            data: {
                stock: {
                    decrement: amount
                }
            }
        });
    }
}

export const shopItemService = new ShopItemService(db.shopItem);