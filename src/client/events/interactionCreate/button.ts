import { Event } from '@/structures'

import { BlacklistStatus } from '@prisma/client'
import { guildService } from '@/database/services'

import { EmbedUI } from '@/ui/EmbedUI'

export default new Event({
    name: 'buttonInteractionCreate',
    async run({ events: [interaction] }) {
        if (interaction.customId.startsWith('accept_')) {
            const userId = interaction.customId.split('_').pop() as string;

            let blacklist = await guildService.findUser(userId);
            if (!blacklist) {
                return await interaction.message.edit({
                    content: null,
                    embeds: [
                        EmbedUI.createMessage({
                            color: 'gray',
                            title: `Signalement introuvable`,
                            description: 'Bizarre, je ne trouve pas le signalement..',
                            timestamp: new Date().toISOString(),
                        })
                    ],
                    components: []
                });
            }

            blacklist = await guildService.updateBlacklistStatus(userId, BlacklistStatus.ACCEPTED);

            this.client.emit('blacklistAccepted', blacklist);

            return await interaction.message.edit({
                content: "Eh hop, c'est validé ! J'envoie un message aux autres serveurs :)",
                embeds: [
                    EmbedUI.createMessage({
                        ...interaction.message.embeds[0],
                        color: 'green',
                        timestamp: new Date().toISOString(),
                        title: '✅ Blacklist validée',
                        footer: {
                            iconURL: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL,
                            text: `Traité par ${interaction.user.username}`
                        }
                    })
                ],
                components: []
            });
        } else if (interaction.customId.startsWith('refuse_')) {
            const userId = interaction.customId.split('_').pop() as string;

            const blacklist = await guildService.findUser(userId);
            if (!blacklist) {
                return await interaction.message.edit({
                    content: null,
                    embeds: [
                        EmbedUI.createMessage({
                            color: 'gray',
                            title: `Signalement introuvable`,
                            description: 'Impossible de refuser, le signalement est introuvable.. :/',
                            timestamp: new Date().toISOString(),
                        })
                    ],
                    components: []
                });
            }

            await guildService.removeBlacklist(userId);

            return await interaction.message.edit({
                content: "Okaay ça marche, j'annule la blacklist",
                embeds: [
                    EmbedUI.createMessage({
                        ...interaction.message.embeds[0],
                        color: 'red',
                        timestamp: new Date().toISOString(),
                        title: '❌ Blacklist refusée',
                        footer: {
                            iconURL: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL,
                            text: `Traité par ${interaction.user.username}`
                        }
                    })
                ],
                components: []
            });
        } else if (interaction.customId.startsWith('bl_authorize_')) {
            const userId = interaction.customId.split('_').pop() as string;

            await interaction.guild!.bans.remove(userId, `Dérogation de ${interaction.user.username}`);
            await guildService.authorizeUserGuildBlacklist(interaction.guild!.id, userId);

            return await interaction.message.edit({
                content: "J'ai autorisé l'utilisateur a rejoindre, je la bannerai plus :)",
                embeds: [
                    EmbedUI.createMessage({
                        ...interaction.message.embeds[0],
                        color: 'gray',
                        timestamp: new Date().toISOString(),
                        title: '✅ Dérogation de blacklist validé',
                        footer: {
                            iconURL: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL,
                            text: `Traité par ${interaction.user.username}`
                        }
                    })
                ],
                components: []
            });
        }
    }
});
