import db from '@/database/db'
import { PrismaUserFlagsString } from '@/database/utils'

import {
    UserUpdateInput,
    UserCreateInput,
} from '@/database/core/models/User'

export type UserCreateInputWithoutId = Omit<UserCreateInput, 'id'>;

class UserService {
    constructor(
        public model: typeof db.user
    ) {}

    async findById(userId: string) {
        return await this.model.findUnique({ where: { id: userId } });
    }

    async findOrCreate(userId: string, data?: Partial<UserCreateInputWithoutId>) {
        return await this.model.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId, ...data }
        });
    }

    async createOrUpdate(userId: string, data: Partial<UserCreateInputWithoutId>) {
        return await this.model.upsert({
            where: { id: userId },
            update: data,
            create: { id: userId, ...data }
        });
    }

    async create(userId: string, data: UserCreateInputWithoutId) {
        return await this.model.create({ data: { id: userId, ...data } });
    }

    async update(userId: string, data: UserUpdateInput) {
        return await this.model.update({
            where: { id: userId },
            data
        });
    }

    async delete(userId: string) {
        return await this.model.delete({
            where: { id: userId }
        });
    }

    //-- Flags --//
    async addFlag(userId: string, flag: PrismaUserFlagsString) {
        return await db.$transaction(async (tx) => {
            const ctx = Object.create(this, {
                model: { value: tx.user }
            });

            const user = await this.findOrCreate.call(ctx, userId);

            return await this.update.call(ctx, userId, {
                flags: user.flags.add(flag).bitfield
            });
        });
    }

    async removeFlag(userId: string, flag: PrismaUserFlagsString) {
        return await db.$transaction(async (tx) => {
            const ctx = Object.create(this, {
                model: { value: tx.user }
            });

            const user = await this.findById.call(ctx, userId);
            if (!user) {
                return await this.create.call(ctx, userId);
            }

            return await this.update.call(ctx, userId, {
                flags: user.flags.remove(flag).bitfield
            });
        });
    }

    //-- Tag --//
    async setTagAssignedAt(userId: string, date?: Date) {
        date ??= new Date();

        return await this.createOrUpdate(userId, {
            tagAssignedAt: date
        });
    }

    async resetTagAssignedAt(userId: string) {
        return await this.createOrUpdate(userId, {
            tagAssignedAt: null
        });
    }
}

export const userService = new UserService(db.user);