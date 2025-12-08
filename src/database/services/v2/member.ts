import db from '@/database/db'

import {
    MemberModel,
    MemberUpdateInput,
    MemberCreateInput,
    UserCreateOrConnectWithoutGuildsInput,
    GuildCreateOrConnectWithoutMembersInput,
} from '@/database/core/models'

export type MemberCreateInputWithoutUserAndGuild = Omit<MemberCreateInput, 'user' | 'guild'>;

interface MemberWhere {
    guildId: string;
    userId: string;
}

type NumberFieldUpdateOptions = MemberWhere & {
    field: keyof MemberModel;
    amount: number;
    max?: number;
    min?: number;
}

class MemberService {
    constructor(
        public model: typeof db.member
    ) { }

    //-- Utility --//
    private _buildWhere(where: MemberWhere) {
        return {
            userId_guildId: where
        };
    }

    private _connectOrCreateUserAndGuild(where: MemberWhere) {
        const build = (value: string) => ({
            connectOrCreate: {
                where: { id: value },
                create: { id: value }
            }
        });

        return {
            user: build(where.userId) as unknown as UserCreateOrConnectWithoutGuildsInput,
            guild: build(where.guildId) as unknown as GuildCreateOrConnectWithoutMembersInput
        }
    }

    private async _updateNumberField(options: NumberFieldUpdateOptions) {
        const {
            userId,
            guildId,
            field,
            amount,
            max,
            min,
        } = options;

        const where = {
            userId,
            guildId
        }

        return await db.$transaction(async (tx) => {
            const ctx = Object.create(this, {
                model: { value: tx.member }
            });

            const member = await this.findOrCreate.apply(ctx, [where]);
            const current = member[field] as unknown as number;

            return await this.update.call(ctx, where, {
                [field]: Math.clamp(current + amount, min ?? 0, max ?? Infinity)
            });
        }) as ReturnType<typeof this.update>;
    }

    //-- CRUD --//
    async findById(where: MemberWhere) {
        return await this.model.findUnique({ where: this._buildWhere(where) });
    }

    async findOrCreate(where: MemberWhere, data?: Partial<MemberCreateInputWithoutUserAndGuild>) {
        return await this.model.upsert({
            where: this._buildWhere(where),
            update: {},
            create: {
                ...data,
                ...this._connectOrCreateUserAndGuild(where)
            }
        });
    }

    async createOrUpdate(where: MemberWhere, data: Partial<MemberCreateInputWithoutUserAndGuild>) {
        return await this.model.upsert({
            where: this._buildWhere(where),
            update: data,
            create: {
                ...data,
                ...this._connectOrCreateUserAndGuild(where)
            }
        });
    }

    async create(where: MemberWhere, data: MemberCreateInputWithoutUserAndGuild) {
        return await this.model.create({
            data: {
                ...this._connectOrCreateUserAndGuild(where)
                ...data,
            }
        });
    }

    async update(where: MemberWhere, data: MemberUpdateInput) {
        return await this.model.update({
            where: this._buildWhere(where),
            data
        });
    }

    async delete(where: MemberWhere) {
        return await this.model.delete({
            where: this._buildWhere(where)
        });
    }

    //-- Activity Xp --//
    async addActivityXp(data: MemberWhere & { amount: number, max?: number }) {
        return await this._updateNumberField({
            ...data,
            field: 'activityXp'
        });
    }

    async removeActivityXp(data: MemberWhere & { amount: number }) {
        return await this._updateNumberField({
            ...data,
            amount: -data.amount,
            field: 'activityXp'
        });
    }

    async setActivityXp(data: MemberWhere & { value: number; max?: number; }) {
        const {
            userId,
            guildId,
            value,
            max
        } = data;

        const where = {
            userId,
            guildId
        }

        return await this.createOrUpdate(where, {
            activityXp: Math.clamp(value, 0, max ?? Infinity)
        });
    }

    //-- Guild Points --//
    async addGuildPoints(data: MemberWhere & { amount: number; max?: number; }) {
        return await this._updateNumberField({
            ...data,
            field: 'guildPoints'
        });
    }

    async removeGuildPoints(data: MemberWhere & { amount: number; max?: number; }) {
        return await this._updateNumberField({
            ...data,
            amount: -data.amount,
            field: 'guildPoints'
        });
    }

    async setGuildPoints(data: MemberWhere & { value: number; max?: number; }) {
        const {
            userId,
            guildId,
            value,
            max
        } = data;

        const where = {
            userId,
            guildId
        }

        return await this.createOrUpdate(where, {
            guildPoints: Math.clamp(value, 0, max ?? Infinity)
        });
    }

    //-- Stats --//
    async incrementVoiceTime(data: MemberWhere & { minutes?: number }) {
        return await this._updateNumberField({
            amount: data?.minutes ?? 1,
            ...data,
            field: 'voiceTotalMinutes'
        });
    }

    async incrementMessageCount(data: MemberWhere & { amount?: number }) {
        return await this._updateNumberField({
            amount: data?.amount ?? 1,
            ...data,
            field: 'voiceTotalMinutes'
        });
    }

    async resetStats(where: MemberWhere) {
        return await this.createOrUpdate(where, {
            voiceTotalMinutes: 0,
            messageCount: 0
        });
    }

    //-- Coldowns --//
    async setLastRobedAt(data: MemberWhere & { date?: Date }) {
        const {
            userId,
            guildId,
            date
        } = data;

        const where = {
            userId,
            guildId
        }

        data.date ??= new Date();

        return await this.createOrUpdate(where, {
            lastRobAt: date
        });
    }
}

export const memberService = new MemberService(db.member);