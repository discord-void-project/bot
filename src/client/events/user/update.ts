import { Event } from '@/structures'
import { userService } from '@/database/services'

const LUNARIA_GUILD_ID = '1280087771540623413'
const REWARD_ROLE_ID = '1301111729182216345'

export default new Event({
    name: 'userUpdate',
    async run({ events: [_, newUser] }) {
        const lunaria = this.client.guilds.cache.get(LUNARIA_GUILD_ID);

        if (lunaria) {
            const member = lunaria.members.cache.get(newUser.id);
            if (!member) return;
    
            const newGuildTagId = newUser.primaryGuild?.identityGuildId
    
            if (newGuildTagId !== LUNARIA_GUILD_ID && member.roles.cache.has(REWARD_ROLE_ID)) {
                if (this.client.isDatabaseConnected) {
                    await userService.resetTagAssignedAt(newUser.id);
                }
                
                return await member.roles.remove(REWARD_ROLE_ID);
            } else if (newGuildTagId === LUNARIA_GUILD_ID && !member.roles.cache.has(REWARD_ROLE_ID)) {
                if (this.client.isDatabaseConnected) {
                    await userService.setTagAssignedAt(newUser.id);
                }

                return await member.roles.add(REWARD_ROLE_ID);
            }
        }
    }
});