import db from '@/database/db'

import { GuildCreateOrConnectWithoutMembersInput } from '@/database/core/models'

import { BlacklistScope } from '@/database/core/enums'

interface ChannelBlacklistWhere {
    guildId: string;
    channelId: string;
    scope: BlacklistScope;
}

class ChannelBlacklistService {
    constructor(public model: typeof db.channelBlacklist) { }

    // -- Utils -- //
    private _buildWhere(where: ChannelBlacklistWhere) {
        return { guildId_scope_channelId: where }
    }

    private _connectOrCreateGuild(where: ChannelBlacklistWhere) {
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
    async findMany({ guildId, channelId }: { guildId: string, channelId: string }) {
        const rows = await this.model.findMany({
            where: { guildId, channelId },
            select: { scope: true },
            distinct: ['scope'],
        });

        return rows.reduce<Record<string, boolean>>((acc, { scope }) => {
            acc[scope] = true;

            return acc;
        }, {}) as Record<BlacklistScope, boolean>;
    }

    async has(where: ChannelBlacklistWhere) {
        const channel = await this.model.findUnique({
            where: this._buildWhere(where)
        });

        return !!channel;
    }

    async hasAny(where: {
        guildId: string;
        scope: BlacklistScope;
        channelIds: string[];
    }) {
        if (!where.channelIds.length) return false;

        const channel = await this.model.findFirst({
            where: {
                guildId: where.guildId,
                scope: where.scope,
                channelId: {
                    in: where.channelIds,
                },
            },
        });

        return !!channel;
    }

    async add(where: ChannelBlacklistWhere) {
        const { scope, channelId } = where;

        return await this.model.upsert({
            where: this._buildWhere(where),
            update: {},
            create: {
                scope,
                channelId,
                ...this._connectOrCreateGuild(where)
            }
        });
    }

    async remove(where: ChannelBlacklistWhere) {
        return await this.model.delete({
            where: this._buildWhere(where)
        });
    }

    async clear(where: { guildId: string; scope: BlacklistScope; channelId?: string }) {
        const { guildId, scope, channelId } = where;

        return await this.model.deleteMany({
            where: { channelId, guildId, scope }
        });
    }
}

export const channelBlacklistService = new ChannelBlacklistService(db.channelBlacklist);