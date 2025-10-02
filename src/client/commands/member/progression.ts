import { Command } from '@/structures'
import { ApplicationCommandOptionType, GuildMember } from 'discord.js'

import { guildSettingsService, memberService } from '@/database/services'

import { createProgressBar } from '@/ui/components'
import { EmbedUI } from '@/ui'

import { getXpProgress, parseUserMention } from '@/utils'
import { applicationEmojiHelper, guildMemberHelper } from '@/helpers'
import prisma from '@/database/prisma'

const buildProgression = async (member: GuildMember) => {
    const { yellowRectEmoji } = applicationEmojiHelper();

    const memberHelper = await guildMemberHelper(member);

    const progressionSetting = await guildSettingsService.findOrCreate(member.guild.id, 'progression');
    if (progressionSetting && progressionSetting.isActive) {
        const memberDatabase = await memberService.find(member.id, member.guild.id);

        if (memberDatabase) {
            const rank = await prisma.member.count({
                where: { xp: { gt: memberDatabase.xp } }
            }) + 1;

            const { current, required } = getXpProgress(memberDatabase.xp)

            return EmbedUI.create({
                color: 'yellow',
                thumbnail: {
                    url: memberHelper.getAvatarURL()
                },
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
                        }),
                    },
                    {
                        name: 'Boosts',
                        value: 'Bientôt disponible ⏳'
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
