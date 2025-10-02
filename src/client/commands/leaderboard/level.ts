import { Command } from '@/structures/Command'
import { Guild } from 'discord.js'

import prisma from '@/database/prisma'
import { mainGuildConfig } from '@/client/config/mainGuild'
import embed from '@/ui/embed'

interface HandleLeaderboardContext {
    interactUserId: string;
    guild: Guild | null;
    reply: (data: any) => Promise<any>;
}

const handleLevelLeaderboard = async ({
    interactUserId,
    guild,
    reply
}: HandleLeaderboardContext) => {
    const allMembers = await prisma.member.findMany({
        where: { guildId: guild!.id },
        select: { userId: true, level: true }
    });

    if (!allMembers.length) {
        return reply({
            embeds: [embed.orange('Aucune donnée de niveaux')]
        });
    }

    const leaderboard = allMembers
        .map((member) => ({
            userId: member.userId,
            level: member.level
        }))
        .filter(entry => entry.level > 0)
        .sort((a, b) => b.level - a.level);

    const totalLevels = leaderboard.reduce((sum, m) => sum + m.level, 0);

    const medals = ['🥇', '🥈', '🥉'];

    const description = await Promise.all(
        leaderboard
            .slice(0, 10)
            .map(async (entry, index) => {
                const member = await guild!.members.fetch(entry.userId).catch(() => null);
                const username = member?.user.username ?? 'Utilisateur inconnu';
                const place = index < 3 ? medals[index] : `**${index + 1}.**`;

                return `${place} ${entry.userId === interactUserId ? `**${username}**` : `\`${username}\``} — niveau **\`${entry.level}\`** 📊`;
            })
    );

    let userPosition = '';
    const userIndex = leaderboard.findIndex(entry => entry.userId === interactUserId);

    if (userIndex >= 10) {
        const userEntry = leaderboard[userIndex];
        const place = `${userIndex + 1}`;

        userPosition = `\n-# Tu es **\`${place}\`** avec le niveau **\`${userEntry.level}\`** 📊`;
    }

    return reply({
        embeds: [
            embed.orange({
                title: '📊 Classement par niveau',
                description: [
                    `🧠 Niveaux cumulés sur le serveur : **${totalLevels.toLocaleString('fr-FR')}**\n`,
                    ...description,
                    userPosition
                ].join('\n')
            })
        ]
    });
};

export default new Command({
    description: 'Classement par niveau des membres',
    nameLocalizations: {
        fr: 'niveaux'
    },
    descriptionLocalizations: {
        fr: 'Classement des membres par niveau'
    },
    messageCommand: {
        aliases: ['toplevel', 'tlevel'],
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        return handleLevelLeaderboard({
            interactUserId: interaction.user.id,
            guild: interaction.guild,
            reply: (data) => interaction.reply(data)
        });
    },
    async onMessage(message) {
        return handleLevelLeaderboard({
            interactUserId: message.author.id,
            guild: message.guild,
            reply: (data) => message.reply(data)
        });
    }
});
