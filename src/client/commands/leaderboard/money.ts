import { Command } from '@/structures/Command'
import { Guild } from 'discord.js'

import prisma from '@/database/prisma'
import { mainGuildConfig } from '@/client/config/mainGuild'
import { EmbedUI } from '@/ui/EmbedUI'
import { formatCompactNumber } from '@/utils'

interface HandleLeaderboardContext {
    interactUserId: string;
    guild: Guild | null;
    reply: (data: any) => Promise<any>;
}

const handleLeaderboardCommand = async ({
    interactUserId,
    guild,
    reply
}: HandleLeaderboardContext) => {
    const allMembers = await prisma.member.findMany({
        where: { guildId: guild!.id },
        select: { userId: true, coins: true, bank: true }
    });

    if (!allMembers.length) {
        return reply({
            embeds: [
                EmbedUI.createMessage('Aucune données', { color: 'yellow' })
            ]
        });
    }

    const leaderboard = allMembers
        .map((member) => ({
            userId: member.userId,
            total: (member.bank?.funds ?? 0) + member.coins
        }))
        .sort((a, b) => b.total - a.total)

    const totalEconomy = allMembers.reduce((sum, m) => sum + (m.bank?.funds ?? 0) + m.coins, 0);

    const medals = ['🥇', '🥈', '🥉'];

    const description = await Promise.all(
        leaderboard
            .slice(0, 10)
            .map(async (entry, index) => {
                const member = await guild!.members.fetch(entry.userId).catch(() => null);
                const username = member?.user.username ?? 'Utilisateur inconnu';
                const total = formatCompactNumber(entry.total);

                const place = index < 3 ? medals[index] : `**${index + 1}.**`;

                return `${place} ${entry.userId === interactUserId ? `**${username}**` : `\`${username}\``} avec **\`${total}\`** :coin:`;
            })
    );

    let userPosition = '';

    const userIndex = leaderboard.findIndex(entry => entry.userId === interactUserId);
    if (userIndex >= 10) {
        const userEntry = leaderboard[userIndex];
        const total = formatCompactNumber(userEntry.total);
        const place = `${userIndex + 1}`;

        userPosition = `\n-# Tu es **\`${place}\`** avec **\`${total}\`** :coin:`;
    }

    return reply({
        embeds: [
            EmbedUI.createMessage({
                color: 'orange',
                title: '🏆 Classement des plus riches',
                description: [
                    `💸 Argent cumulé sur le serveur: **${formatCompactNumber(totalEconomy)}**\n`,
                    ...description,
                    userPosition
                ].join('\n'),
            })
        ]
    });
};

export default new Command({
    description: 'Show the richest members and total server money',
    nameLocalizations: {
        fr: 'argent'
    },
    descriptionLocalizations: {
        fr: 'Classement des plus riches + total argent du serveur'
    },
    messageCommand: {
        aliases: ['topmoney', 'tmoney'],
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        return handleLeaderboardCommand({
            interactUserId: interaction.user.id,
            guild: interaction.guild,
            reply: (data) => interaction.reply(data)
        });
    },
    async onMessage(message) {
        return handleLeaderboardCommand({
            interactUserId: message.author.id,
            guild: message.guild,
            reply: (data) => message.reply(data)
        });
    }
});
