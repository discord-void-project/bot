import { GuildMember } from 'discord.js'
import { guildService, userService } from '@/database/services'

export async function handleMemberSupporterRoleSync(member: GuildMember) {
    const userId = member.id;
    const guild = member.guild;
    const guildId = guild.id;

    const { supportRoleId } = await guildService.findById(guildId) ?? {};
    if (!supportRoleId) return;

    const hasTag = member.user.primaryGuild?.identityGuildId === guildId;
    const hasRole = member.roles.cache.has(supportRoleId);

    if (hasTag && hasRole) return;

    if (!hasTag && hasRole) {
        await userService.resetTagAssignedAt(userId);
        await member.roles.remove(supportRoleId);
    } else if (hasTag && !hasRole) {
        await userService.setTagAssignedAt(userId);
        await member.roles.add(supportRoleId);
    }
}
