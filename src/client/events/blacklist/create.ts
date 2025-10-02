import { Event } from '@/structures'

import { actionRow, button } from '@/ui/components'
import embed from '@/ui/embed'

export default new Event({
    name: 'blacklistCreate',
    async run({ events: [blacklist] }) {
        const reportChannel = this.client.mainGuild.reportChannel
        if (!reportChannel) return

        return await reportChannel.send({
            content: "Hey ! Je vous transmet cette demande pour ajouter quelqu'un sur blacklist ;)",
            embeds: [
                embed.orange({
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
                actionRow([
                    button.green('Accepter', {
                        custom_id: `accept_${blacklist.userId}`
                    }),
                    button.red('Refuser', {
                        custom_id: `refuse_${blacklist.userId}`
                    })
                ])
            ]
        })
    }
})
