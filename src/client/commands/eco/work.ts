import { Command } from '@/structures/Command'

import { guildSettingsService, memberService } from '@/database/services'
import { mainGuildConfig } from '@/client/config'

import { EmbedUI } from '@/ui/EmbedUI'
import { createCooldown } from '@/utils'

interface HandleWorkContext {
    userId: string;
    guildId: string;
    username: string;
    reply: (data: any) => Promise<any>;
}

const handleWorkCommand = async ({
    userId,
    guildId,
    username,
    reply
}: HandleWorkContext) => {
    const { member } = await memberService.findOrCreate(userId, guildId);
    const ecoSettings = await guildSettingsService.findOrCreate(guildId, 'eco');

    const COOLDOWN = (ecoSettings.workCooldown ?? 30) * 60 * 1000;
    const MIN_REWARD = ecoSettings.workMinGain ?? 25;
    const MAX_REWARD = ecoSettings.workMaxGain ?? 75;

    const { isActive, expireTimestamp } = createCooldown(member.lastWorkAt, COOLDOWN);
    const now = Date.now();

    if (isActive) {
        const remaining = expireTimestamp - now;
        const minutesLeft = Math.ceil(remaining / (1000 * 60));
        return reply({
            embeds: [
                EmbedUI.createMessage({
                    color: 'red',
                    title: '⏳ Travail déjà effectué',
                    description: `Vous devez attendre encore **${minutesLeft} min** avant de retravailler`,
                }),
            ],
        });
    }

    let reward = Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD;

    const chance = Math.random();
    let bonus = 0;
    let phraseBonus = '';

    if (chance < 0.1) {
        bonus = Math.floor(Math.random() * 50) + 20;
        reward += bonus;
        phraseBonus = `🎉 Chance incroyable ! Vous obtenez un bonus de **${bonus} pièces** !`;
    } else if (chance < 0.3) {
        bonus = Math.floor(Math.random() * 20) + 5;
        reward += bonus;
        phraseBonus = `✨ Aujourd'hui, vous avez un petit bonus de **${bonus} pièces** !`;
    }

    await memberService.updateOrCreate(userId, guildId, {
        update: {
            coins: { increment: reward },
            lastWorkAt: new Date(),
        },
    });

    const phrases = [
        `Bravo ! Vous avez travaillé dur aujourd'hui et gagné **${reward} pièces** !`,
        `Vous avez bien travaillé et gagné **${reward} pièces** !`,
        `Super travail ! Vos efforts rapportent **${reward} pièces** !`
    ];

    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    return reply({
        embeds: [
            EmbedUI.createMessage({
                color: 'green',
                title: `💼 Travail de ${username}`,
                description: phrase + (phraseBonus ? `\n${phraseBonus}` : ''),
            }),
        ],
    });
};

export default new Command({
    description: 'work to earn daily coins',
    nameLocalizations: {
        fr: 'travail',
    },
    descriptionLocalizations: {
        fr: "travail pour gagner des pièces quotidiennement"
    },
    messageCommand: {
        style: 'flat',
        aliases: ['work', 'w'],
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        return handleWorkCommand({
            userId: interaction.user.id,
            guildId: interaction.guild!.id,
            username: interaction.user.globalName ?? interaction.user.username,
            reply: (data) => interaction.reply(data)
        });
    },
    async onMessage(message) {
        return handleWorkCommand({
            userId: message.author.id,
            guildId: message.guild!.id,
            username: message.author.globalName ?? message.author.username,
            reply: (data) => message.reply(data)
        });
    }
});
