import { Prisma } from '../core/client'
import { tierCapacity } from '../services/member-bank-service'

export const memberBankExtension = Prisma.defineExtension({
    result: {
        memberBank: {
            maxCapacity: {
                needs: { tier: true },
                compute({ tier }) {
                    return tierCapacity[tier];
                },
            },
        },
    },
})