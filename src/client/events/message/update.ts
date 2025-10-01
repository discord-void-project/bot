import { Event } from '@/structures'
import { EmbedUI } from '@/ui/EmbedUI'

export default new Event({
    name: 'messageUpdate',
    async run({ events: [oldMessage, newMessage] }) {
        if (!oldMessage.guild
            || newMessage.author?.bot
            || oldMessage.content === newMessage.content
            || !oldMessage.content
            || !newMessage.content
            || this.client.mainGuild.id !== oldMessage.guild.id
            || process.env.ENV == 'DEV'
        ) return;

        const logChannel = this.client.mainGuild.updateLogChannel;
        if (!logChannel) return;

        return await logChannel.send({
            embeds: [
                EmbedUI.createMessage({
                    color: 'orange',
                    author: {
                        name: newMessage.author!.username,
                        iconURL: newMessage.author?.displayAvatarURL()
                    },
                    description: `✏️ **Message modifié dans <#${newMessage.channel.id}>**`,
                    fields: [
                        { name: 'Avant', value: oldMessage.content.slice(0, 1024) },
                        { name: 'Après', value: newMessage.content.slice(0, 1024) }
                    ],
                    footer: {
                        text: `UID: ${newMessage.author!.id}`
                    },
                    timestamp: new Date().toISOString()
                })
            ]
        });
    }
})