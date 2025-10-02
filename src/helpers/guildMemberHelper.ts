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
}

export const guildMemberHelper = async (member: GuildMember, options?: GuildMemberHelperOptions) => {
    if (options?.fetchAll || options?.fetchMember) {
        member = await member.fetch();
    }

    if (options?.fetchAll || options?.fetchUser) {
        await member.user.fetch();
    }

    return {
        getName(options?: GuildMemberHelperGetNameOptions) {
            let name = null;

            const nickname = options?.nickname ?? true
            const globalName = options?.globalName ?? true
            const username = options?.username ?? true

            if (username && member.user.username) {
                name = member.user.username
            }

            if (globalName && member.user.globalName) {
                name = member.user.globalName
            }

            if (nickname && member.nickname) {
                name = member.nickname
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