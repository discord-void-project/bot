import { Command } from '@/structures/Command'
import { ApplicationCommandOptionType } from 'discord.js'

import { blacklistService } from '@/database/services'
import { EmbedUI } from '@/ui/EmbedUI'

export default new Command({
    access: {
        user: {
            isStaff: true
        }
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'user',
                description: 'user to blacklist',
                name_localizations: {
                    fr: 'utilisateur'
                },
                description_localizations: {
                    fr: 'utilisateur à mettre sur liste noir'
                },
                required: true
            },
            {
                type: ApplicationCommandOptionType.String,
                name: 'reason',
                description: 'reason of blacklist',
                name_localizations: {
                    fr: 'raison'
                },
                description_localizations: {
                    fr: 'raison de la mise en liste noir'
                }
            }
        ]
    },
    async onInteraction(interaction) {
        const user = interaction.options.getUser('user', true)

        const formatTimestamp = (date: Date) => Math.floor(date.getTime() / 1000);

        let blacklist = await blacklistService.findById(user.id);
        if (blacklist) {
            return await interaction.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'red',
                        title: "Ajout d'un utilisateur sur blacklist",
                        description: `L'utilisateur \`${user.id}\` est déjà sur la blacklist, depuis <t:${formatTimestamp(blacklist.blacklistAt)}>`
                    })
                ]
            });
        }

        const mod = interaction.user;
        const reason = interaction.options.getString('reason') ?? 'Aucune raison spécifiée';

        blacklist = await blacklistService.add({
            modId: mod.id,
            userId: user.id,
            reason,
        });

        this.client.emit('blacklistCreate', blacklist);

        return await interaction.reply({
            content: "Deux petites secondes.. Et voilà, j'ai transmis le signalement !",
            embeds: [
                EmbedUI.createMessage({
                    color: 'green',
                    title: "🕵️ Détails de la blacklist",
                    fields: [
                        {
                            name: "👤 Utilisateur",
                            value: `- <@${blacklist.userId}>\n- \`${user.id}\``,
                            inline: true
                        },
                        {
                            name: "🛡️ Modérateur",
                            value: `- <@${blacklist.modId}>\n- \`${mod.id}\``,
                            inline: true
                        },
                        {
                            name: "📖 Raison",
                            value: reason,
                            inline: false
                        }
                    ],
                    footer: {
                        text: mod.username,
                        iconURL: mod.avatarURL() ?? undefined,
                    },
                    timestamp: new Date().toISOString()
                }),
            ]
        });
    }
})