import { Command } from '@/structures'
import { MessageFlags } from 'discord.js'

import embed from '@/ui/embed'
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
                    embed.red(`L'unlockage ne prends pas encore en compte les salons textuel :c`)
                ]
            })
        };

        const msg = await interaction.reply({
            embeds: [
                embed.orange(`Unlocking en cours..`)
            ]
        });

        const members = [
            ...interaction.channel.members.values()
        ].filter((m) => m.voice.serverMute);

        if (members.length < 1) {
            return await msg.edit({
                embeds: [
                    embed.red(`Aucune personne a démuté 👌`)
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
                embed.green(`**${members.length}** personnes ont été demuté`)
            ]
        });
    }
})