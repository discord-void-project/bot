import { Event } from '@/structures'
import db from '@/database/db'

export default new Event({
    name: 'databaseReady',
    once: true,
    async run() {
        db.logger.log('✅ » Connexion established\n')
        this.client.isDatabaseConnected = true;
    }
})