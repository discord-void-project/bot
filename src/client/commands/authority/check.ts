import { Command } from '@/structures/Command'

import db from '@/database/db'
import { guildService } from '@/database/services'

import { createActionRow, createButton } from '@/ui/components/common'
import { EmbedUI } from '@/ui/EmbedUI'

import { parseUserMention } from '@/utils'

export default new Command({
    access: {
        user: {
            isStaff: true
        }
    },
    messageCommand: {
        style: 'slashCommand'
    },
    async onMessage(message, { args: [userId] }) {
        userId = parseUserMention(userId) ?? userId ?? message.author.id;

        const [userDatabase, banInfo] = await Promise.all([
            db.blacklist.findUnique({
                where: { userId },
                include: {
                    user: true,
                    guilds: {
                        where: { guildId: message.guild.id }
                    }
                }
            }),
            message.guild.bans.fetch(userId).catch(() => null)
        ]);

        if (!userDatabase && !banInfo) {
            return await message.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'green',
                        title: "✅ Rapport d'autorité",
                        description: `L'utilisateur <@${userId}> \`(${userId})\` est **en règle** dans ce serveur.`
                    })
                ]
            });
        }

        let guildBlacklist = userDatabase?.guilds[0];

        const buildPayload = () => {
            const components: any[] = [];

            const derogationButton = () => {
                return guildBlacklist?.accepted
                    ? createButton('Retirer autorisation', { color: 'red', customId: 'unallow' })
                    : createButton('Autoriser', { color: 'green', customId: 'allow' });
            }

            if (userDatabase?.status === 'ACCEPTED') {
                components.push(
                    createActionRow([ derogationButton() ])
                );
            }

            return {
                embeds: [
                    EmbedUI.createMessage({
                        color: 'purple',
                        title: "📋 Rapport d'autorité",
                        fields: [
                            {
                                name: '👤 Utilisateur',
                                value: [
                                    `- <@${userId}>`,
                                    `- **ID**: \`${userId}\``
                                ].join('\n'),
                            },
                            {
                                name: '⛔ Blacklisté',
                                value: userDatabase
                                    ? userDatabase.status === 'PENDING'
                                        ? 'En vérification'
                                        : `Oui\n**Raison**: ${userDatabase.reason ?? 'Non spécifiée'}`
                                    : 'Non',
                            },
                            {
                                name: '⚖️ Dérogation',
                                value: guildBlacklist?.accepted ? 'Oui' : 'Non',
                            },
                            {
                                name: '🔨 Banni du serveur',
                                value: banInfo ? `Oui\n**Raison**: ${banInfo.reason ?? 'Non spécifiée'}` : 'Non',
                            }
                        ],
                        timestamp: new Date().toISOString()
                    })
                ],
                components
            }
        }

        const msg = await message.reply(buildPayload());

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 30_000
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'allow') {
                guildBlacklist = await guildService.authorizeUserGuildBlacklist(i.guild.id, userId) as any
            } else if (i.customId === 'unallow') {
                guildBlacklist = await guildService.unauthorizeUserGuildBlacklist(i.guild.id, userId);
            }

            return await i.update(buildPayload());
        });

        collector.on('end', async () => {
            return await msg.edit({
                components: []
            });
        });
    }
});
