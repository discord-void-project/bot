import { Prisma } from '../core/client'
import { UserFlagsBitField } from '@/database/utils'

export const userExtension = Prisma.defineExtension({
    result: {
        user: {
            flags: {
                needs: { flags: true },
                compute({ flags }) {
                    return new UserFlagsBitField(flags);
                },
            },
        },
    },
})