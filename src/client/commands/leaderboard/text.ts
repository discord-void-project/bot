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

const handleMessageLeaderboard = async ({
    interactUserId,
    guild,
    reply
}: HandleLeaderboardContext) => {
    const allMembers = await prisma.member.findMany({
        where: { guildId: guild!.id },
        select: { userId: true, messageCount: true }
    });

    if (!allMembers.length) {
        return reply({
            embeds: [embed.orange('Aucune donnée de messages')]
        });
    }

    const leaderboard = allMembers
        .map((member) => ({
            userId: member.userId,
            count: member.messageCount
        }))
        .sort((a, b) => b.count - a.count);

    const totalMessages = leaderboard.reduce((sum, m) => sum + m.count, 0);

    const medals = ['🥇', '🥈', '🥉'];

    const description = await Promise.all(
        leaderboard
            .slice(0, 10)
            .map(async (entry, index) => {
                const member = await guild!.members.fetch(entry.userId).catch(() => null);
                const username = member?.user.username ?? 'Utilisateur inconnu';
                const place = index < 3 ? medals[index] : `**${index + 1}.**`;

                return `${place} ${entry.userId === interactUserId ? `**${username}**` : `\`${username}\``} avec **\`${entry.count.toLocaleString('fr-FR')}\`** messages 📨`;
            })
    );

    let userPosition = '';
    const userIndex = leaderboard.findIndex(entry => entry.userId === interactUserId);

    if (userIndex >= 10) {
        const userEntry = leaderboard[userIndex];
        const place = `${userIndex + 1}`;

        userPosition = `\n-# Tu es **\`${place}\`** avec **\`${userEntry.count.toLocaleString('fr-FR')}\`** messages 📨`;
    }

    return reply({
        embeds: [
            embed.orange({
                title: '💬 Classement des plus bavards',
                description: [
                    `🧾 Total des messages sur le serveur : **${totalMessages.toLocaleString('fr-FR')}**\n`,
                    ...description,
                    userPosition
                ].join('\n')
            })
        ]
    });
};

export default new Command({
    description: 'Show the most active members by message count',
    nameLocalizations: {
        fr: 'messages'
    },
    descriptionLocalizations: {
        fr: 'Classement des membres les plus actifs en messages'
    },
    messageCommand: {
        aliases: ['ttext', 'toptext'],
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        return handleMessageLeaderboard({
            interactUserId: interaction.user.id,
            guild: interaction.guild,
            reply: (data) => interaction.reply(data)
        });
    },
    async onMessage(message) {
        return handleMessageLeaderboard({
            interactUserId: message.author.id,
            guild: message.guild,
            reply: (data) => message.reply(data)
        });
    }
});
