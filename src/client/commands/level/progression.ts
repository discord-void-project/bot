import { Command } from '@/structures'
import {
    ApplicationCommandOptionType,
    GuildFeature,
    GuildMember
} from 'discord.js'

import {
    guildSettingsService,
    memberService,
    userService
} from '@/database/services'

import { createProgressBar } from '@/ui/components'
import { EmbedUI } from '@/ui'

import { guildMemberHelper } from '@/helpers'
import {
    dateElapsedRatio,
    getDominantColor,
    parseUserMention,
    xpToNextLevel
} from '@/utils'
import { createBoostLine } from '@/ui/components/createBoostLine'

const MAX_GUILD_TAG_BOOST = 0.1;
const MAX_GUILD_NITRO_BOOST = 0.2;

const buildEmbed = async (member: GuildMember) => {
    const memberHelper = await guildMemberHelper(member);

    if (member.user.bot) {
        return EmbedUI.createErrorMessage({
            title: `${memberHelper.getName({ safe: true })} — Expérience`,
            description: `Les bots ne possèdent pas de progression d'XP ni de rang dans le classement`
        });
    }

    const userId = member.id;
    const guild = member.guild;
    const guildId = guild.id;

    const progressionSetting = await guildSettingsService.findOrCreate(guildId, 'progression');
    if (!progressionSetting?.isActive) {
        return EmbedUI.createErrorMessage('Le module de progression est désactivé pour ce serveur');
    }

    const memberAvatar = memberHelper.getAvatarURL();

    const [
        memberAvatarDominantColor,
        memberData,
        leaderboard,
        user
    ] = await Promise.all([
        getDominantColor(memberAvatar),
        memberService.findById({ userId, guildId }),
        memberService.getActivityXpRank({ userId, guildId }),
        userService.findById(userId)
    ]);

    const activityXp = memberData?.activityXp ?? 0;

    const {
        currentXp,
        currentLevel,
        nextLevel,
        xpProgress,
        xpForLevel
    } = xpToNextLevel(activityXp)

    const tagBoostPercent = Math.floor(
        dateElapsedRatio(user?.tagAssignedAt, 14)
        * MAX_GUILD_TAG_BOOST * 100
    );

    const guildBoostPercent = Math.floor(
        (member.premiumSince
            ? dateElapsedRatio(member.premiumSince, 7) * MAX_GUILD_NITRO_BOOST
            : 0) * 100
    )

    const guildHasTag = guild.features.find((f) => f === GuildFeature.GuildTags);

    const fields = [
        {
            name: 'Niveau',
            value: `**${currentLevel.toLocaleString('en')}** ➜ **${nextLevel.toLocaleString('en')}**`,
            inline: true
        },
        {
            name: 'Progression',
            value: [
                createProgressBar(Math.max(0, xpProgress / xpForLevel), { length: 7, asciiChar: true, showPercentage: true }),
                `**${xpProgress.toLocaleString('en')}** / **${xpForLevel.toLocaleString('en')}** XP`
            ].join('\n'),
            inline: true
        },
        {
            name: 'Rang',
            value: activityXp > 0
                ? `**${leaderboard.rank.toLocaleString('en')}** / **${leaderboard.total.toLocaleString('en')}**`
                : 'Non Classé',
            inline: true
        },
        {
            name: "Total d'XP",
            value: currentXp.toLocaleString('en')
        },
        {
            name: 'Boosts',
            value: [
                '- '.concat(createBoostLine({
                    label: 'Boost du serveur',
                    value: guildBoostPercent,
                    max: MAX_GUILD_NITRO_BOOST * 100,
                    arrowColor: 'green'
                })),
                guildHasTag && createBoostLine({
                    label: 'Tag du serveur',
                    value: tagBoostPercent,
                    max: MAX_GUILD_TAG_BOOST * 100,
                    arrowColor: 'green'
                }),
            ].filter(Boolean).join('\n- ')
        }
    ];

    return EmbedUI.create({
        color: memberAvatarDominantColor,
        thumbnail: { url: memberAvatar },
        title: `${memberHelper.getName({ safe: true })} — Expérience`,
        description: '> 💡 Seuls les membres avec de l’XP sont pris en compte dans le classement !',
        fields,
        footer: {
            iconURL: member.guild.iconURL() ?? undefined,
            text: member.guild.name
        },
        timestamp: Date.now()
    });
};

export default new Command({
    description: "🧪 Display a member's progression",
    descriptionLocalizations: {
        fr: "🧪 Afficher la progression d'un membre"
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
            embeds: [await buildEmbed(member)],
        });
    }
});
