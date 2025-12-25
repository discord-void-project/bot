import db from '@/database/db'
import { BlacklistStatus } from '@/database/core/enums'

interface BlacklistMutationData {
    modId: string;
}

class BlacklistService {
    constructor(
        public model: typeof db.blacklist
    ) {}

    private _buildUserJoin(userId: string) {
        return {
            connectOrCreate: {
                where: { id: userId },
                create: { id: userId }
            }
        };
    }

    async findById(userId?: string) {
        return await this.model.findUnique({ where: { userId } });
    }

    async add(data: { userId: string, reason?: string } & BlacklistMutationData) {
        const { userId, modId, ...props } = data;

        return await this.model.upsert({
            where: { userId },
            create: {
                ...props,
                user: this._buildUserJoin(userId),
                mod: this._buildUserJoin(modId),
            },
            update: {},
            include: {
                mod: true,
                user: true,
            }
        });
    }

    async updateState(userId: string, status: BlacklistStatus) {
        return await this.model.update({
            where: { userId },
            data: { status }
        });
    }

    async remove(userId: string) {
        return await this.model.delete({
            where: { userId }
        });
    }
}

export const blacklistService = new BlacklistService(db.blacklist);