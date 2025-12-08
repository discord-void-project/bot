import db from '@/database/db'

import {
    GuildUpdateInput,
    GuildCreateInput,
} from '@/database/core/models/Guild'

export type GuildCreateInputWithoutId = Omit<GuildCreateInput, 'id'>;

class GuildService {
    constructor(
        public model: typeof db.guild
    ) {}

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
        return this.model.create({ data: { id: guildId, ...data } });
    }

    async update(guildId: string, data: GuildUpdateInput) {
        return this.model.update({
            where: { id: guildId },
            data
        });
    }

    async delete(guildId: string) {
        return this.model.delete({
            where: { id: guildId }
        });
    }
}

export const guildService = new GuildService(db.guild);