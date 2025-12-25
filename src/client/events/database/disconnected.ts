import { Event } from '@/structures'

import db from '@/database/db'

export default new Event({
    name: 'databaseDisconnected',
    once: true,
    async run({ events: [ex] }) {
        db.logger.error(`❌ » ${ex}`);
    }
})