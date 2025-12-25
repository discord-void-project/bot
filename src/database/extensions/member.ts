import { Prisma } from '../core/client'
import { xpToLevel } from '@/utils/math'

export const memberExtension = Prisma.defineExtension({
    result: {
        member: {
            activityLevel: {
                needs: { activityXp: true },
                compute({ activityXp }) {
                    return xpToLevel(activityXp);
                },
            },
        },
    },
})