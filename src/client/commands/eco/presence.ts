import { GuildMember } from 'discord.js'
import { Command } from '@/structures/Command'

import { memberService } from '@/database/services'

import { applicationEmojiHelper, guildMemberHelper } from '@/helpers'
import { EmbedUI, EmbedUIData } from '@/ui/EmbedUI'

import {
    createCooldown,
    formatCompactNumber,
    getDateByLocale,
    getDominantColor,
    randomNumber
} from '@/utils'

import { mainGuildConfig } from '@/client/config'

const MIN_REWARD = 250;
const MAX_REWARD = 750;

const STREAK_STEP = 7;

const ONE_DAY_COLDOWN = 24 * 60 * 60 * 1000;

const getStreakDay = (streak: number) => streak % STREAK_STEP || STREAK_STEP;
const checkIsSameDay = (last: Date | null, now: number) => last && now - last.getTime() <= ONE_DAY_COLDOWN;

const buildEmbed = async (member: GuildMember) => {
    const { whiteArrowEmoji } = applicationEmojiHelper();

    const userId = member.user.id;
    const guildId = member.guild.id;
    const guildLocale = member.guild.preferredLocale;

    const memberKey = { userId, guildId }

    const memberHelper = await guildMemberHelper(member, { fetchAll: true });
    const memberAvatarDominantColor = await getDominantColor(memberHelper.getAvatarURL({ forceStatic: true }));

    let { dailyStreak, lastAttendedAt } = await memberService.findOrCreate(memberKey);

    const lastAttendedAtDate = lastAttendedAt && getDateByLocale(member.guild.preferredLocale, lastAttendedAt);
    const nowTZ = getDateByLocale(guildLocale).getTime();
    const todayTZ = getDateByLocale(guildLocale);
    todayTZ.setHours(24, 0, 0, 0);

    const midnightTZ = todayTZ.getTime();

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

    const { isActive, expireTimestamp } = createCooldown(lastAttendedAtDate, midnightTZ - nowTZ);

    const getDailyStreakDay = () => Math.min(dailyStreak % 7, 7);

    if (isActive) {
        const remaining = expireTimestamp - nowTZ;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        const timeLeft =
            hours > 0
                ? minutes > 0
                    ? `**${hours}h ${minutes}min**`
                    : `**${hours}h**`
                : `**${minutes}min**`;

        payload.color = memberAvatarDominantColor;
        message = `Vous devez attendre encore ${timeLeft} avant de refaire valoir votre présence !`;
    } else {
        const isSameDay = checkIsSameDay(lastAttendedAtDate, nowTZ);

        const data = isSameDay
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
            authorizedIds: [
                mainGuildConfig.id
            ]
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