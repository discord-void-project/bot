import db from '@/database/db'

import { GuildCreateOrConnectWithoutMembersInput, GuildLevelRewardCreateInput } from '@/database/core/models'

interface GuildLevelRewardWhere {
    guildId: string;
    atLevel: number;
}

type GuildLevelRewardCreateInputWithoutGuildAndAtLevel = Omit<GuildLevelRewardCreateInput, 'atLevel' | 'guild'>

class GuildLevelRewardService {
    constructor(public model: typeof db.guildLevelReward) { }

    // -- Utils -- //
    private _buildWhere(where: GuildLevelRewardWhere) {
        return { guildId_atLevel: where }
    }

    private _connectOrCreateGuild(where: GuildLevelRewardWhere) {
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

    async addOrUpdate(where: GuildLevelRewardWhere, data: Partial<GuildLevelRewardCreateInputWithoutGuildAndAtLevel>) {
        if (!(data.guildPointsReward || data.roleId)) return null;

        return await this.model.upsert({
            where: this._buildWhere(where),
            update: data,
            create: {
                ...data,
                atLevel: where.atLevel,
                isStackable: data.roleId
                    ? data.isStackable ?? true
                    : null,
                ...this._connectOrCreateGuild(where)
            }
        });
    }

    async remove(where: GuildLevelRewardWhere) {
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

export const guildLevelRewardService = new GuildLevelRewardService(db.guildLevelReward);