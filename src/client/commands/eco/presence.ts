import { GuildMember } from 'discord.js'
import { Command } from '@/structures/Command'

import { memberService } from '@/database/services'

import { applicationEmojiHelper, guildMemberHelper } from '@/helpers'
import { EmbedUI, EmbedUIData } from '@/ui/EmbedUI'

import {
    formatCompactNumber,
    formatTimeLeft,
    getDominantColor,
    randomNumber,
    tzMap
} from '@/utils'
import { DateTime } from 'luxon'

const MIN_REWARD = 250;
const MAX_REWARD = 750;

const STREAK_STEP = 7;

const getStreakDay = (streak: number) => streak % STREAK_STEP || STREAK_STEP;

const buildEmbed = async (member: GuildMember) => {
    const { whiteArrowEmoji } = applicationEmojiHelper();

    const userId = member.user.id;
    const guildId = member.guild.id;
    const guildLocale = member.guild.preferredLocale;
    const guildTZ = tzMap[guildLocale] || 'UTC';

    const memberKey = { userId, guildId }

    const memberHelper = await guildMemberHelper(member, { fetchAll: true });
    const memberAvatarDominantColor = await getDominantColor(memberHelper.getAvatarURL({ forceStatic: true }));

    let { dailyStreak, lastAttendedAt } = await memberService.findOrCreate(memberKey);

    const lastInGuildTZ = lastAttendedAt ? DateTime.fromJSDate(lastAttendedAt, { zone: guildTZ }) : null;
    const nowInGuildTZ = DateTime.now().setZone(guildTZ);

    const midnightInGuildTZ = nowInGuildTZ.endOf('day');

    const isSameDay = lastInGuildTZ ? lastInGuildTZ.hasSame(nowInGuildTZ, 'day') : false;

    let message: string;

    const payload = {
        thumbnail: {
            url: memberHelper.getAvatarURL()
        },
        title: `Présence de ${memberHelper.getName()}`,
        timestamp: Date.now(),
        footer: {
            text: `Les données de présence sont réinitialisées à minuit`
        }
    } as Partial<EmbedUIData>

    const getDailyStreakDay = () => Math.min(dailyStreak % 7, 7);

    if (isSameDay) {
        payload.color = memberAvatarDominantColor;
        message = `Vous devez attendre encore ${formatTimeLeft(midnightInGuildTZ.toMillis(), nowInGuildTZ.toMillis())} avant de refaire valoir votre présence !`;
    } else {
        const yesterdayInGuildTZ = nowInGuildTZ.minus({ days: 1 });
        const isSameDayAsYesterday = lastInGuildTZ ? lastInGuildTZ.hasSame(yesterdayInGuildTZ, 'day') : false;

        const data = isSameDayAsYesterday
            ? await memberService.incrementDailyStreak(memberKey)
            : await memberService.resetDailyStreak(memberKey);

        dailyStreak = data.dailyStreak;
        
        const baseReward = randomNumber(MIN_REWARD, MAX_REWARD);

        const streakDay = getStreakDay(dailyStreak);
        const bonusReward = streakDay === STREAK_STEP ? Math.floor(baseReward * 1.75) : 0;

        const totalReward = baseReward + bonusReward;
        
        await Promise.all([
            memberService.setLastAttendedAt(memberKey),
            memberService.addGuildCoins(memberKey, totalReward),
        ]);

        message = bonusReward
            ? `🔥 **Jour ${dailyStreak}** ! Vous gagnez **${baseReward} + ${formatCompactNumber(bonusReward)} pièces bonus** 🎁`
            : `Vous avez gagné **${totalReward} pièces** pour votre présence d'aujourd'hui !`;

    }

    return EmbedUI.createMessage({
        color: 'green',
        ...payload,
        description: message,
        fields: [
            {
                name: 'Progression',
                value: [
                    `Encore **${7 - (dailyStreak % 7)}** jours avant d'obtenir un **bonus**`,
                    `${Array.from({ length: 7 }, (_, i) => {
                        return i < getDailyStreakDay() ? '▰' : '▱'
                    }).join('')} (${dailyStreak % 7} / 7)`
                ].join('\n'),
                inline: true
            },
            {
                name: 'Série quotidienne',
                value: `🔥 ${whiteArrowEmoji} **${dailyStreak}** jours`,
                inline: true
            },
        ]
    })
}

export default new Command({
    nameLocalizations: {
        fr: 'présence'
    },
    description: '⌛ Execute every day to earn daily server coins',
    descriptionLocalizations: {
        fr: '⌛ Faite votre présence tous les jours pour gagner des pièces de serveur quotidiennement'
    },
    messageCommand: {
        style: 'flat',
        aliases: [
            'presence',
            'p',
            'daily'
        ],
    },
    access: {
        guild: {
            modules: {
                eco: true
            }
        }
    },
    async onInteraction(interaction) {
        return await interaction.reply({
            embeds: [await buildEmbed(interaction.member)],
        });
    },
    async onMessage(message) {
        return await message.reply({
            embeds: [await buildEmbed(message.member as GuildMember)],
        });
    }
})