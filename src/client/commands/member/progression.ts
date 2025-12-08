import { Command } from '@/structures'
import { ApplicationCommandOptionType, GuildMember } from 'discord.js'

import { guildSettingsService, memberService, userService } from '@/database/services'

import { createProgressBar } from '@/ui/components'
import { EmbedUI } from '@/ui'

import { dateElapsedRatio, getXpProgress, parseUserMention } from '@/utils'
import { applicationEmojiHelper, guildMemberHelper } from '@/helpers'
import db from '@/database/db'

const MAX_TAG_BOOST = 0.1;

const buildProgression = async (member: GuildMember) => {
    const { yellowRectEmoji, yellowArrowEmoji } = applicationEmojiHelper();
    const memberHelper = await guildMemberHelper(member);
    const progressionSetting = await guildSettingsService.findOrCreate(member.guild.id, 'progression');

    if (progressionSetting && progressionSetting.isActive) {
        const memberDatabase = await memberService.find(member.id, member.guild.id);

        if (memberDatabase) {
            const rank = await db.member.count({
                where: { xp: { gt: memberDatabase.xp } }
            }) + 1;

            const { current, required } = getXpProgress(memberDatabase.xp);

            const user = await userService.findById(member.id);

            const ratio = user?.tagAssignedAt
                ? dateElapsedRatio(new Date(user.tagAssignedAt), 14)
                : 0;

            const tagBoostValue = ratio * MAX_TAG_BOOST;
            const tagBoostPercent = Math.round(tagBoostValue * 100);
            const maxTagBoostPercent = Math.round(MAX_TAG_BOOST * 100);

            return EmbedUI.create({
                color: 'yellow',
                thumbnail: { url: memberHelper.getAvatarURL() },
                title: `Progression de ${memberHelper.getName()}`,
                fields: [
                    {
                        name: 'Niveau',
                        value: `**${memberDatabase.level}** ➜ **${memberDatabase.level + 1}**`,
                        inline: true
                    },
                    {
                        name: 'XP',
                        value: `**${current}** / **${required}**`,
                        inline: true
                    },
                    {
                        name: 'Rang',
                        value: `**${rank}**`,
                        inline: true
                    },
                    {
                        name: 'Progression',
                        value: createProgressBar(current / required, {
                            length: 7,
                            filledChar: yellowRectEmoji?.toString(),
                            showPercentage: true
                        })
                    },
                    {
                        name: 'Boosts',
                        value: [
                            `- Tag du serveur ${yellowArrowEmoji} **+${tagBoostPercent}%** / **${maxTagBoostPercent}% MAX**`
                        ].join('\n')
                    }
                ],
                timestamp: Date.now()
            });
        } else {
            return EmbedUI.createErrorMessage({
                title: `Progression de ${memberHelper.getName()}`,
                description: 'Aucune progression'
            });
        }
    }

    return EmbedUI.createErrorMessage('Le module de progression est désactivé pour ce serveur');
}

export default new Command({
    description: "🧪 Retrieves a user's progress",
    descriptionLocalizations: {
        fr: "🧪 Récupère la progression d'un utilisateur"
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'member',
                description: 'member',
                name_localizations: {
                    fr: 'membre'
                },
                description_localizations: {
                    fr: 'membre'
                }
            }
        ]
    },
    async onInteraction(interaction) {
        const member = interaction.options.getMember('member') ?? interaction.member;

        return await interaction.reply({
            allowedMentions: {},
            embeds: [await buildProgression(member)],
        });
    },
    async onMessage(message, { args: [userId] }) {
        const member = userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member;

        return await message.reply({
            allowedMentions: {},
            embeds: [await buildProgression(member as GuildMember)],
        });
    }
});
