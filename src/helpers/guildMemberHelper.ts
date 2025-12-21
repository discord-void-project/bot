import { escapeSafe, isOnlySpaces } from '@/utils';
import { GuildMember, ImageURLOptions } from 'discord.js'

export interface GuildMemberHelperOptions {
    fetchMember?: boolean;
    fetchUser?: boolean;
    fetchAll?: boolean;
}

export interface GuildMemberHelperGetNameOptions {
    nickname?: boolean;
    globalName?: boolean;
    username?: boolean;
    safe?: boolean;
}

export const guildMemberHelperSync = (member: GuildMember) => {
    return {
        getName(options?: GuildMemberHelperGetNameOptions) {
            let name = 'unknown';

            const nickname = options?.nickname ?? true
            const globalName = options?.globalName ?? true
            const username = options?.username ?? true

            if (username && member.user.username) {
                name = member.user.username
            }

            if (globalName && member.user.globalName) {
                const safe = escapeSafe(member.user.globalName);

                name = options?.safe
                    ? !isOnlySpaces(safe) && safe.length > 2 ? safe : member.user.username
                    : member.user.globalName
            }

            if (nickname && member.nickname) {
                const safe = escapeSafe(member.nickname);

                name = options?.safe
                    ? !isOnlySpaces(safe) && safe.length > 2 ? safe : member.user.username
                    : member.nickname
            }

            return name;
        },
        getAvatarURL(options?: ImageURLOptions) {
            return member?.displayAvatarURL?.(options) ?? member.user?.displayAvatarURL?.(options);
        },
        getBannerURL(options?: ImageURLOptions) {
            return member?.bannerURL?.(options) ?? member.user?.bannerURL?.(options);
        }
    }
}

export const guildMemberHelper = async (member: GuildMember, options?: GuildMemberHelperOptions) => {
    if (options?.fetchAll || options?.fetchMember) {
        member = await member.fetch();
    }

    if (options?.fetchAll || options?.fetchUser) {
        await member.user.fetch();
    }

    return guildMemberHelperSync(member);
}