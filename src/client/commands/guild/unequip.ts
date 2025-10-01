import { Command } from '@/structures/Command'
import { GuildMember, MessageFlags } from 'discord.js'

import { shopItemService } from '@/database/services'
import { mainGuildConfig } from '@/client/config'

import { EmbedUI } from '@/ui/EmbedUI'
import { actionRow, button } from '@/ui/components'

export default new Command({
    description: 'unequip a role color',
    nameLocalizations: {
        fr: 'déséquiper'
    },
    descriptionLocalizations: {
        fr: "déséquiper un rôle couleur"
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        const allItems = await shopItemService.findMany(interaction.guild!.id);
        const member = interaction.member as GuildMember

        const roles = allItems.filter((f) => member.roles.cache.has(f.roleId));

        if (!roles.length) {
            return await interaction.reply({
                embeds: [
                    EmbedUI.createMessage(`Vous n'avez aucun rôle payant d'équipé !`, { color: 'red' })
                ]
            });
        }

        const msg = await interaction.reply({
            embeds: [
                EmbedUI.createMessage({
                    color: 'orange',
                    description: [
                        `Voulez-vous vraiment déséquipé votre rôle couleur ?`,
                        '-# Remarque : une fois le rôle supprimé vous ne serez pas **remboursé**'
                    ].join('\n')
                })
            ],
            components: [
                actionRow([
                    button.green('Confirmer', { custom_id: '#confirm' }),
                    button.red('Annuler', { custom_id: '#cancel' })
                ])
            ],
            flags: MessageFlags.Ephemeral
        })

        try {
            const res = await msg.awaitMessageComponent({
                filter: (i) => i.user.id === interaction.user.id,
                time: 60_000
            });

            if (res.customId === '#confirm') {
                for (const item of roles) {
                    await member.roles.remove(item.roleId);
                }

                return await res.reply({
                    embeds: [
                        EmbedUI.createMessage(`Le rôle couleur vous a bien été déséquipé !`, { color: 'green' })
                    ]
                });
            }

            return await res.reply({
                embeds: [
                    EmbedUI.createMessage(`Opération annnuler !`, { color: 'green' })
                ]
            });
        } catch {
            return await msg.edit({
                embeds: [
                    EmbedUI.createMessage(`Une erreur est survenu`, { color: 'red' })
                ]
            })
        }
    }
})