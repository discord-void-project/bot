import { Command } from '@/structures/Command'

import { guildSettingsService, memberService } from '@/database/services'
import { mainGuildConfig } from '@/client/config'
import { createCooldown } from '@/utils'
import embed from '@/ui/embed'

interface handleCommandContext {
    userId: string;
    guildId: string;
    username: string;
    reply: (data: any) => Promise<any>
}

const handleCommand = async ({
    userId,
    guildId,
    username,
    reply
}: handleCommandContext) => {
    const { member } = await memberService.findOrCreate(userId, guildId);
    const ecoSettings = await guildSettingsService.findOrCreate(guildId, 'eco');

    const COOLDOWN = 24 * 60 * 60 * 1000;
    const MIN_REWARD = ecoSettings.dailyMinGain;
    const MAX_REWARD = ecoSettings.dailyMaxGain;

    const getReward = () => Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD;

    const { isActive, expireTimestamp } = createCooldown(member.lastDailyAt, COOLDOWN);
    const now = Date.now();

    if (isActive) {
        const remaining = expireTimestamp - now;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        const timeLeft =
            hours > 0
                ? `**${hours}h ${minutes}min**`
                : `**${minutes}min**`;

        return reply({
            embeds: [
                embed.red({
                    title: '⏳ Présence déjà effectuée',
                    description: `Vous devez attendre encore ${timeLeft} avant de refaire valoir votre présence.`,
                })
            ]
        });
    }

    const reward = getReward();

    await memberService.updateOrCreate(userId, guildId, {
        update: {
            bank: { increment: reward },
            lastDailyAt: new Date()
        },
    });

    return reply({
        embeds: [
            embed.green({
                title: `✅ Présence de ${username}`,
                description: `Bravo ! Vous avez gagné **${reward} pièces** pour votre présence d'aujourd'hui !`,
            })
        ]
    });
}

export default new Command({
    nameLocalizations: {
        fr: 'présence'
    },
    description: 'daily',
    messageCommand: {
        style: 'flat',
        aliases: ['presence', 'p'],
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        return handleCommand({
            userId: interaction.user.id,
            guildId: interaction.guild!.id,
            username: interaction.user.globalName ?? interaction.user.username,
            reply: (data) => interaction.reply(data)
        });
    },
    async onMessage(message) {
        return handleCommand({
            userId: message.author.id,
            guildId: message.guild!.id,
            username: message.author.globalName ?? message.author.username,
            reply: (data) => message.reply(data)
        });
    }
})