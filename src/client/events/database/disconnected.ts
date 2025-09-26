import { Event } from '@/structures'

import { prismaLogger } from '@/database/prisma'

export default new Event({
    name: 'databaseDisconnected',
    once: true,
    async run({ events: [ex] }) {
        prismaLogger.error(`❌ » ${ex}`);
    }
})