import { Collection } from 'discord.js'
import { Event } from '@/structures'

import { startAllJobs } from '@/client/jobs/index.js'
import prisma from '@/database/db'

export default new Event({
    once: true,
    name: 'clientReady',
    async run() {
        this.client.logger.log('✅ » Successfully logged in !\n');

        const lunaria = this.client.guilds.cache.get('1280087771540623413')
        if (lunaria && process.env.ENV === 'PROD') {
            lunaria.members.cache.get('1175882929826713791')?.send('Je viens de démarrer !')
        }

        try {
            await prisma.$connect();
            this.client.emit('databaseReady');
        } catch (ex) {
            this.client.emit('databaseDisconnected', ex);
        }

        await startAllJobs();
    }
})