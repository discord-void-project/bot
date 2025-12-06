import { Event } from '@/structures'

import { userService } from '@/database/services'
import db from '@/database/db';

const LUNARIA_GUILD_ID = '1280087771540623413';
const REWARD_ROLE_ID = '1301111729182216345';

export default new Event({
    name: 'databaseReady',
    once: true,
    async run() {
        db.logger.log('✅ » Connexion established\n')
        this.client.isDatabaseConnected = true;

        const guild = await this.client.guilds.fetch(LUNARIA_GUILD_ID);
        if (guild) {
            const members = await guild.members.fetch();

            for (const member of members.values()) {
                const guildTagId = member.user.primaryGuild?.identityGuildId;

                if (guildTagId !== LUNARIA_GUILD_ID && member.roles.cache.has(REWARD_ROLE_ID)) {
                    await userService.resetTagAssignedAt(member.id);
                    await member.roles.remove(REWARD_ROLE_ID);
                } else if (guildTagId === LUNARIA_GUILD_ID && !member.roles.cache.has(REWARD_ROLE_ID)) {
                    await userService.setTagAssignedAt(member.id);
                    await member.roles.add(REWARD_ROLE_ID);
                }
            }
        }
    }
})