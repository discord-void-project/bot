import { Command } from '@/structures'
import { MessageFlags } from 'discord.js'

import { EmbedUI } from '@/ui/EmbedUI'
import { mainGuildConfig } from '@/client/config/mainGuild'

export default new Command({
    description: 'Test',
    access: {
        user: {
            requiredPermissions: ['MuteMembers']
        },
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        if (!interaction.channel?.isVoiceBased()) {
            return await interaction.reply({
                flags: MessageFlags.Ephemeral,
                embeds: [
                    EmbedUI.createMessage(`L'unlockage ne prends pas encore en compte les salons textuel :c`, { color: 'red' })
                ]
            })
        };

        const msg = await interaction.reply({
            embeds: [
                EmbedUI.createMessage(`Unlocking en cours..`, { color: 'orange' })
            ]
        });

        const members = [
            ...interaction.channel.members.values()
        ].filter((m) => m.voice.serverMute);

        if (members.length < 1) {
            return await msg.edit({
                embeds: [
                    EmbedUI.createMessage(`Aucune personne a démuté 👌`, { color: 'red' })
                ]
            });
        }

        for (const member of members) {
            try {
                await member.edit({
                    mute: false
                });
            } catch (ex) {
                console.error(ex);
            }
        }

        return await msg.edit({
            embeds: [
                EmbedUI.createMessage(`**${members.length}** personnes ont été demuté`, { color: 'green' })
            ]
        });
    }
})