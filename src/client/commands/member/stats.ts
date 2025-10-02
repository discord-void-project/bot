import { Command } from '@/structures'
import { ApplicationCommandOptionType, GuildMember } from 'discord.js'

import { memberService } from '@/database/services'

import { EmbedUI } from '@/ui'

import { parseUserMention } from '@/utils'
import { guildMemberHelper } from '@/helpers'

const buildStats = async (member: GuildMember) => {
    const memberHelper = await guildMemberHelper(member, { fetchAll: true });

    const memberDatabase = await memberService.find(member.id, member.guild.id) ?? {
        messageCount: 0,
        voiceTotalMinutes: 0
    };

    const formatTime = (time: number) => {
        if (time >= 60) {
            return `**${Math.floor(time / 60)}** heures`;
        } else {
            return `**${time}** minutes`;
        }
    }

    return EmbedUI.create({
        color: 'indigo',
        thumbnail: {
            url: memberHelper.getAvatarURL()
        },
        title: `Stats de ${memberHelper.getName()}`,
        fields: [
            {
                name: '💬 Messages envoyés',
                value: `**${memberDatabase.messageCount}**`,
                inline: true,
            },
            {
                name: '🔊 Minutes en vocal',
                value: `${formatTime(memberDatabase.voiceTotalMinutes)}`,
                inline: true,
            },
        ],
        timestamp: Date.now()
    });
}

export default new Command({
    description: "📊 Retrieves a user's stats",
    descriptionLocalizations: {
        fr: "📊 Récupère les stats d'un utilisateur"
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
            embeds: [await buildStats(member)],
        });
    },
    async onMessage(message, { args: [userId] }) {
        const member = userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member;

        return await message.reply({
            allowedMentions: {},
            embeds: [await buildStats(member as GuildMember)],
        });
    }
});
