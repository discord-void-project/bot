import { Prisma } from '../core/client'
import { xpToLevel } from '@/utils/math'

export const memberExtension = Prisma.defineExtension({
    result: {
        member: {
            level: {
                needs: { xp: true },
                compute({ xp }) {
                    return xpToLevel(xp);
                },
            },
        },
    },
})