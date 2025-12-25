import { Prisma } from '../core/client'
import { PrismaUserFlagsBitField } from '@/database/utils'

export const userExtension = Prisma.defineExtension({
    result: {
        user: {
            flags: {
                needs: { flags: true },
                compute({ flags }) {
                    return new PrismaUserFlagsBitField(flags);
                },
            },
        },
    },
})