import { Event } from '@/structures'
import { handleMemberSupporterRoleSync } from '@/client/handlers/member-supporter-role-sync'

export default new Event({
    name: 'userUpdate',
    async run({ events: [oldUser, newUser] }) {
        const oldGuildId = oldUser.primaryGuild?.identityGuildId;
        const newGuildId = newUser.primaryGuild?.identityGuildId;

        if (oldGuildId === newGuildId) return;

        for (const guildId of [oldGuildId, newGuildId]) {
            if (!guildId) continue;

            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) continue;

            const member = guild.members.cache.get(newUser.id);
            if (!member) continue;

            await handleMemberSupporterRoleSync(member);
        }
    }
});