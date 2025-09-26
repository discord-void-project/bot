import { GuildMember, ImageURLOptions } from 'discord.js'

export interface GuildMemberHelperOptions {
    fetchMember?: boolean
    fetchUser?: boolean
}

export interface GuildMemberHelperGetNameOptions {
    nickname?: boolean;
    globalName?: boolean;
    username?: boolean;
}

export const guildMemberHelper = async (member: GuildMember, options?: GuildMemberHelperOptions) => {
    if (options?.fetchMember) {
        member = await member.fetch();
    }

    if (options?.fetchUser) {
        await member.user.fetch();
    }

    return {
        getName(options?: GuildMemberHelperGetNameOptions) {
            let name = null;

            const nickname = options?.nickname ?? true
            const globalName = options?.globalName ?? true
            const username = options?.username ?? true

            if (nickname) {
                name = member.nickname
            } else if (globalName) {
                name = member.user.globalName
            } else if (username) {
                name = member.user.username
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