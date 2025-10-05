import { Prisma } from '@prisma/client'
import { tierCapacity } from '../services/memberBankService'

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