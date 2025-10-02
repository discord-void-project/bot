import { Command } from '@/structures'
import { ApplicationCommandOptionType, ComponentType, GuildMember, MessageFlags } from 'discord.js'

import prisma from '@/database/prisma'
import { guildSettingsService, memberService } from '@/database/services'
import { UserFlags } from '@/database/utils'

import { mainGuildConfig } from '@/client/config/mainGuild'

import useEmojis from '@/ui/useEmojis'
import container from '@/ui/container'
import { section, textDisplay, thumbnail } from '@/ui/components'

import { formatCompactNumber } from '@/utils'
import { getXpProgress } from '@/utils/math'
import { getDominantColor } from '@/utils/image'

import { guildMemberHelper } from '@/helpers'

export default new Command({
    nameLocalizations: {
        fr: 'profil'
    },
    description: "📋 Retrieves a user's information",
    descriptionLocalizations: {
        fr: "📋 Récupère les informations d'un utilisateur"
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'user',
                description: 'user',
                name_localizations: {
                    fr: 'utilisateur'
                },
                description_localizations: {
                    fr: 'utilisateur'
                }
            }
        ]
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        const { whiteArrowEmoji } = useEmojis();

        const member = (interaction.options.getMember('user') ?? interaction.member) as GuildMember;
        const isBot = member.user.bot;

        const memberHelper = await guildMemberHelper(member, { fetchUser: true });
        const memberAvatar = memberHelper.getAvatarURL({ forceStatic: true });
        const memberBanner = memberHelper.getBannerURL({ size: 512 });

        const createdAt = Math.floor(member.user.createdTimestamp / 1000);
        const joinedAt = Math.floor(member.joinedTimestamp! / 1000);
        const pseudo = memberHelper.getName({ username: false });
        const username = member.user.username;

        const hasGuildTag = member.user.primaryGuild?.identityGuildId === member.guild.id;

        const userDatabase = await prisma.user.findUnique({
            where: {
                id: member.id
            }
        });

        const userTagAssignedAt = userDatabase?.tagAssignedAt
            ? Math.floor(new Date(userDatabase.tagAssignedAt).getTime() / 1000)
            : null;

        let memberTitle: string | undefined;
        let userRecord: any = {
            level: 1,
            xp: 0,
            messageCount: 0,
            voiceTotalMinutes: 0,
            coins: 0,
            bank: 0,
            auras: 0,
        };

        if (!isBot) {
            const data = this.client.voiceSessions.get(member.id);
            if (data?.timestamp) {
                const now = Date.now();
                const elapsed = now - data.timestamp;
                const minutesElapsed = Math.floor(elapsed / (60 * 1000));

                if (minutesElapsed >= 1) {
                    await memberService.updateOrCreate(member.id, interaction.guild!.id, {
                        create: { voiceTotalMinutes: minutesElapsed },
                        update: { voiceTotalMinutes: { increment: minutesElapsed } }
                    });

                    this.client.voiceSessions.set(member.id, { ...data, timestamp: now });
                }
            }

            const result = await prisma.member.findUnique({
                where: {
                    userId_guildId: {
                        userId: member.user.id,
                        guildId: member.guild.id
                    },
                },
                include: {
                    user: true
                }
            });

            if (result) userRecord = result;

            if (result) {
                if (result.user.flags.has(UserFlags.BETA)) {
                    memberTitle = 'Testeur du bot';
                } else if (result.user.flags.has(UserFlags.STAFF)) {
                    memberTitle = 'Autorité: STAFF';
                }
            }

            if (!memberTitle && member.premiumSince) {
                memberTitle = 'Booster du serveur'
            }
        } else {
            memberTitle = 'Robot Discord';
        }

        const profileSection = section({
            accessory: thumbnail(memberAvatar),
            components: [
                textDisplay(`## ${pseudo || username}${pseudo ? ` \`(${username})\`` : ''}`),
                textDisplay([
                    memberTitle && `-# *${memberTitle}*\n`,
                    `**Identifiant**\n- **\`${member.id}\`**`,
                    (userDatabase?.tagAssignedAt && hasGuildTag) && `**Porte le tag du serveur depuis**\n- <t:${userTagAssignedAt}>\n- <t:${userTagAssignedAt}:R>`,
                    `**Membre depuis**\n- <t:${joinedAt}>\n- <t:${joinedAt}:R>`,
                    `**Création du compte**\n- <t:${createdAt}>\n- <t:${createdAt}:R>`,
                ].filter(Boolean).join('\n'))
            ]
        });

        const components: any[] = [];

        if (memberBanner) {
            components.push({
                type: ComponentType.MediaGallery,
                items: [
                    {
                        media: {
                            url: memberBanner
                        }
                    }
                ]
            });
        }

        components.push(profileSection);

        if (!isBot) {
            const { eco, progression } = await guildSettingsService.findManyOrCreate(interaction.guild!.id, ['eco', 'progression']);

            const isEcoEnabled = eco?.isActive;
            const isProgressionEnabled = progression?.isActive;

            const isLevelMax = userRecord.level >= progression!.maxLevel;
            const { current, required } = getXpProgress(userRecord.xp)

            const formatTime = (time: number) => {
                if (time >= 60) {
                    return `**${Math.floor(userRecord.voiceTotalMinutes / 60)}** heures`;
                } else {
                    return `**${userRecord.voiceTotalMinutes}** minutes`;
                }
            }

            components.push(...[
                isProgressionEnabled && textDisplay([
                    '**Progression**',
                    `⚡ ${whiteArrowEmoji} Nv. **${userRecord.level}**${isLevelMax ? ' \`(MAX)\`' : ''}`,
                    !isLevelMax && `🧪 ${whiteArrowEmoji} **${formatCompactNumber(current)}** / **${formatCompactNumber(required)}**`
                ].filter(Boolean).join('\n')),
                isEcoEnabled && textDisplay([
                    '**Fonds**',
                    `🏦 ${whiteArrowEmoji} **${formatCompactNumber(userRecord.bank)}** / **${formatCompactNumber(50000)}** en banque`,
                    `💶 ${whiteArrowEmoji} **${formatCompactNumber(userRecord.coins)}** en poche`
                ].join('\n')),
                textDisplay([
                    '**States**',
                    `💬 ${whiteArrowEmoji} ${userRecord.messageCount ? `**${formatCompactNumber(userRecord.messageCount)}** messages envoyés` : "Jamais écris"}`,
                    `🔊 ${whiteArrowEmoji} ${userRecord.voiceTotalMinutes ? `${formatTime(userRecord.voiceTotalMinutes)} en vocal` : 'Jamais parlé'}`
                ].join('\n'))
            ].filter(Boolean));
        }

        return await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                container.custom({
                    accent_color: await getDominantColor(memberAvatar),
                    components
                })
            ]
        });
    }
});
