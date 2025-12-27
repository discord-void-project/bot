import db from '@/database/db'

import {
    GuildUpdateInput,
    GuildCreateInput,
} from '@/database/core/models/Guild'

export type GuildCreateInputWithoutId = Omit<GuildCreateInput, 'id'>;

class GuildService {
    constructor(public model: typeof db.guild) { }

    // -- CRUD -- //
    async findById(guildId: string) {
        return await this.model.findUnique({ where: { id: guildId } });
    }

    async findOrCreate(guildId: string, data?: Partial<GuildCreateInputWithoutId>) {
        return await this.model.upsert({
            where: { id: guildId },
            update: {},
            create: { id: guildId, ...data }
        });
    }

    async createOrUpdate(guildId: string, data: Partial<GuildCreateInputWithoutId>) {
        return await this.model.upsert({
            where: { id: guildId },
            update: data,
            create: { id: guildId, ...data }
        });
    }

    async create(guildId: string, data: GuildCreateInputWithoutId) {
        return await this.model.create({ data: { id: guildId, ...data } });
    }

    async update(guildId: string, data: GuildUpdateInput) {
        return await this.model.update({
            where: { id: guildId },
            data
        });
    }

    async delete(guildId: string) {
        return await this.model.delete({
            where: { id: guildId }
        });
    }

    // -- Setter -- //
    async setWelcomeChannel(guildId: string, channelId: string | null) {
        return await this.createOrUpdate(guildId, { welcomeChannelId: channelId });
    }

    async setSupportRole(guildId: string, roleId: string | null) {
        return await this.createOrUpdate(guildId, { supportRoleId: roleId });
    }

    async setMessageDeletedAuditChannel(guildId: string, channelId: string | null) {
        return await this.createOrUpdate(guildId, { messageDeletedAuditChannelId: channelId });
    }

    async setMessageEditedAuditChannel(guildId: string, channelId: string | null) {
        return await this.createOrUpdate(guildId, { messageEditedAuditChannelId: channelId });
    }

    async setLastEventAt(guildId: string, date?: Date | null) {
        if (date === undefined) {
            date = new Date();
        }
        
        return await this.createOrUpdate(guildId, { lastEventAt: date });
    }
}

export const guildService = new GuildService(db.guild);