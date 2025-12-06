import { Command } from '@/structures/Command'
import { Guild } from 'discord.js'

import db from '@/database/db'
import { mainGuildConfig } from '@/client/config/mainGuild'
import { EmbedUI } from '@/ui/EmbedUI'

interface HandleLeaderboardContext {
    interactUserId: string;
    guild: Guild | null;
    reply: (data: any) => Promise<any>;
}

const handleVoiceLeaderboard = async ({
    interactUserId,
    guild,
    reply
}: HandleLeaderboardContext) => {
    const allMembers = await db.member.findMany({
        where: { guildId: guild!.id },
        select: { userId: true, voiceTotalMinutes: true }
    });

    if (!allMembers.length) {
        return reply({
            embeds: [
                EmbedUI.createMessage('Aucune donnée de vocal', { color: 'orange' })
            ]
        });
    }

    const leaderboard = allMembers
        .map((member) => ({
            userId: member.userId,
            minutes: member.voiceTotalMinutes
        }))
        .filter(entry => entry.minutes > 0)
        .sort((a, b) => b.minutes - a.minutes);

    const totalMinutes = leaderboard.reduce((sum, m) => sum + m.minutes, 0);
    const totalHours = Math.floor(totalMinutes / 60);

    const medals = ['🥇', '🥈', '🥉'];

    const description = await Promise.all(
        leaderboard
            .slice(0, 10)
            .map(async (entry, index) => {
                const member = await guild!.members.fetch(entry.userId).catch(() => null);
                const username = member?.user.username ?? 'Utilisateur inconnu';
                const hours = (entry.minutes / 60).toFixed(1);

                const place = index < 3 ? medals[index] : `**${index + 1}.**`;

                return `${place} ${entry.userId === interactUserId ? `**${username}**` : `\`${username}\``} avec **\`${hours}\`h** en vocal 🔊`;
            })
    );

    let userPosition = '';
    const userIndex = leaderboard.findIndex(entry => entry.userId === interactUserId);

    if (userIndex >= 10) {
        const userEntry = leaderboard[userIndex];
        const place = `${userIndex + 1}`;
        const hours = (userEntry.minutes / 60).toFixed(1);

        userPosition = `\n-# Tu es **\`${place}\`** avec **\`${hours}\`h** en vocal 🔊`;
    }

    return reply({
        embeds: [
            EmbedUI.createMessage({
                color: 'orange',
                title: '🔊 Classement des plus actifs en vocal',
                description: [
                    `🕒 Temps cumulé sur le serveur : **${totalHours.toLocaleString('fr-FR')}h**\n`,
                    ...description,
                    userPosition
                ].join('\n')
            })
        ]
    });
};

export default new Command({
    description: 'Classement vocal par temps passé en vocal',
    nameLocalizations: {
        fr: 'vocal'
    },
    descriptionLocalizations: {
        fr: 'Classement des membres les plus actifs en vocal'
    },
    messageCommand: {
        aliases: ['topvoice', 'tvoice']
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        return handleVoiceLeaderboard({
            interactUserId: interaction.user.id,
            guild: interaction.guild,
            reply: (data) => interaction.reply(data)
        });
    },
    async onMessage(message) {
        return handleVoiceLeaderboard({
            interactUserId: message.author.id,
            guild: message.guild,
            reply: (data) => message.reply(data)
        });
    }
});
