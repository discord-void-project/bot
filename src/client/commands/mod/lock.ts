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
                    EmbedUI.createMessage(`Le lockage ne prends pas encore en compte les salons textuel :c`, { color: 'red' })
                ]
            })
        };

        const msg = await interaction.reply({
            embeds: [
                EmbedUI.createMessage(`Locking en cours..`, { color: 'orange' })
            ]
        });

        const members = [
            ...interaction.channel.members.values()
        ].filter((m) => !m.permissions.has('MuteMembers'));

        for (const member of members) {
            try {
                await member.edit({
                    mute: true
                });
            } catch (ex) {
                console.error(ex);
            }
        }

        return await msg.edit({
            embeds: [
                EmbedUI.createMessage(`**${members.length}** personnes ont été muté`, { color: 'green' })
            ]
        });
    }
})