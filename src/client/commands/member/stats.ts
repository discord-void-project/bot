import { Command } from '@/structures'
import { ApplicationCommandOptionType, GuildMember } from 'discord.js'

import { memberService } from '@/database/services'

import { EmbedUI } from '@/ui'

import { getDominantColor, parseUserMention } from '@/utils'
import { guildMemberHelper } from '@/helpers'

const createStatField = (label: string, value: any, inline = false) => ({
    name: label,
    value,
    inline
});

const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return h > 0
        ? m > 0
            ? `**${h.toLocaleString('en')}** heures et **${m}** minutes`
            : `**${h.toLocaleString('en')}** heures`
        : `**${m}** minutes`;
};

const buildEmbed = async (member: GuildMember) => {
    const [memberHelper, memberDatabase] = await Promise.all([
        guildMemberHelper(member, { fetchAll: true }),
        memberService.findById({ userId: member.id, guildId: member.guild.id })
    ]);

    const memberAvatarDominantColor = await getDominantColor(memberHelper.getAvatarURL());

    const { messageCount = 0, voiceTotalMinutes = 0 } = memberDatabase ?? {};

    return EmbedUI.create({
        color: memberAvatarDominantColor,
        description: `> 💡 Voici un résumé de votre activité sur le serveur !`,
        thumbnail: {
            url: memberHelper.getAvatarURL()
        },
        title: `${memberHelper.getName({ safe: true })} — Serveur Stats`,
        fields: [
            createStatField('💬 Messages envoyés', messageCount ? `**${messageCount.toLocaleString('en')}**` : 'Aucun message envoyé'),
            createStatField('🔊 Temps en vocal', voiceTotalMinutes ? formatTime(voiceTotalMinutes) : 'Aucun temps passé en vocal'),
        ],
        footer: {
            iconURL: member.guild.iconURL() ?? undefined,
            text: member.guild.name,
        },
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
            embeds: [await buildEmbed(member)],
        });
    },
    async onMessage(message, { args: [userId] }) {
        const member = (userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member) as GuildMember;

        return await message.reply({
            allowedMentions: {},
            embeds: [await buildEmbed(member as GuildMember)],
        });
    }
});
