import db from '@/database/db'
import { BlacklistGuildModel } from '@/database/core/models'

import { userService } from './user'

interface BlacklistGuildWhere {
    guildId: string;
    userId: string;
}

class BlacklistGuildService {
    constructor(
        public model: typeof db.blacklistGuild
    ) {}

    async findById(where: BlacklistGuildWhere) {
        return await this.model.findUnique({
            where: {
                guildId_userId: where
            }
        });
    }

    async authorize(where: BlacklistGuildWhere) {
        const { userId } = where;

        return await db.$transaction(async (tx) => {
            let ctx = Object.create(userService, {
                model: { value: tx.user }
            });
            
            const blacklist = await userService.findById.call(ctx, userId);
            if (!blacklist) return null;

            ctx = Object.create(this, {
                model: { value: tx.blacklistGuild }
            });

            let exemption = await this.findById.call(ctx, where) as BlacklistGuildModel | null;
            if (!exemption) {
                exemption = await tx.blacklistGuild.create({
                    data: {
                        accepted: true,
                        ...where
                    }
                })
            }

            return exemption;
        });
    }

    async unauthorize(where: BlacklistGuildWhere) {
        return await db.$transaction(async (tx) => {
            const ctx = Object.create(this, {
                model: { value: tx.blacklistGuild }
            });

            let exemption = await this.findById.call(ctx, where) as BlacklistGuildModel | null;
            if (exemption) {
                const data = await tx.blacklistGuild.delete({ where });
    
                return {
                    ...data,
                    accepted: false
                }
            }
        });
    }
}

export const blacklistGuildService = new BlacklistGuildService(db.blacklistGuild);