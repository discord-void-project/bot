import { Event } from '@/structures'

import { guildService } from '@/database/services'
import { EmbedUI } from '@/ui/EmbedUI'

export default new Event({
    name: 'messageDelete',
    async run({ events: [message] }) {
        if (!message.guild || message.author?.bot || !message.content || message.channel.isDMBased()) return;

        const { messageDeletedAuditChannelId } = await guildService.findById(message.guild.id) ?? {};
        if (!messageDeletedAuditChannelId) return;

        const channel = message.guild.channels.cache.get(messageDeletedAuditChannelId);
        if (!channel?.isTextBased()) return;

        return await channel.send({
            embeds: [
                EmbedUI.createMessage({
                    color: 'red',
                    author: {
                        name: message.author!.username,
                        iconURL: message.author?.displayAvatarURL()
                    },
                    description: `🗑️ **Message supprimé**`,
                    fields: [
                        {
                            name: 'Salon',
                            value: `<#${message.channel.id}> (\`${message.channel.name}\`)`,
                        },
                        {
                            name: 'Contenu',
                            value: message.content.slice(0, 1024)
                        }
                    ],
                    footer: {
                        text: `UID: ${message.author!.id}`
                    },
                    timestamp: Date.now()
                })
            ]
        });
    }
})