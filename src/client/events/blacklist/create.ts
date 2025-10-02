import { Event } from '@/structures'

import { createActionRow, createButton } from '@/ui/components/common'
import { EmbedUI } from '@/ui/EmbedUI'

export default new Event({
    name: 'blacklistCreate',
    async run({ events: [blacklist] }) {
        const reportChannel = this.client.mainGuild.reportChannel
        if (!reportChannel) return

        return await reportChannel.send({
            content: "Hey ! Je vous transmet cette demande pour ajouter quelqu'un sur blacklist ;)",
            embeds: [
                EmbedUI.createMessage({
                    color: 'orange',
                    title: "🕵️ Nouvelle demande de Blacklist",
                    fields: [
                        {
                            name: "👤 Utilisateur",
                            value: `- <@${blacklist.userId}>\n- \`${blacklist.userId}\``,
                            inline: true
                        },
                        {
                            name: "🛡️ Modérateur",
                            value: `- <@${blacklist.modId}>\n- \`${blacklist.modId}\``,
                            inline: true
                        },
                        {
                            name: "📄 Raison",
                            value: blacklist.reason ?? "Aucune raison spécifiée",
                            inline: false
                        }
                    ],
                    timestamp: blacklist.blacklistAt.toISOString()
                })
            ],
            components: [
                createActionRow([
                    createButton('Accepter', {
                        color: 'green',
                        customId: `accept_${blacklist.userId}`
                    }),
                    createButton('Refuser', {
                        color: 'red',
                        customId: `refuse_${blacklist.userId}`
                    })
                ])
            ]
        })
    }
})
