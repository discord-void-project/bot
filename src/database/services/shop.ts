import db from '@/database/db'

import {
    GuildCreateOrConnectWithoutMembersInput,
    ShopCreateInput
} from '@/database/core/models'

interface ShopWhere {
    guildId: string;
    name: string;
}

type ShopCreateInputWithoutGuildAndAtLevel = Omit<ShopCreateInput, 'guild' | 'name'>

class ShopService {
    constructor(public model: typeof db.shop) { }

    // -- Utils -- //
    private _buildWhere(where: ShopWhere) {
        return { guildId_name: where };
    }

    private _connectOrCreateGuild(where: ShopWhere) {
        const { guildId } = where;

        return {
            guild: {
                connectOrCreate: {
                    where: { id: guildId },
                    create: { id: guildId }
                }
            } as unknown as GuildCreateOrConnectWithoutMembersInput
        }
    }

    // -- CRUD -- //
    async all(guildId: string) {
        return await this.model.findMany({
            where: { guildId }
        });
    }

    async findById(where: ShopWhere) {
        return await this.model.findUnique({
            where: this._buildWhere(where)
        });
    }

    async addOrUpdate(where: ShopWhere, data: Partial<ShopCreateInputWithoutGuildAndAtLevel>) {
        return await this.model.upsert({
            where: this._buildWhere(where),
            update: data,
            create: {
                ...data,
                name: where.name,
                ...this._connectOrCreateGuild(where)
            }
        });
    }

    async remove(where: ShopWhere) {
        return await this.model.delete({
            where: this._buildWhere(where)
        });
    }

    async clear(guildId: string) {
        return await this.model.deleteMany({
            where: { guildId }
        });
    }
}

export const shopService = new ShopService(db.shop);