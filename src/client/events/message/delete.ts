import { Event } from '@/structures'
import embed from '@/ui/embed'

export default new Event({
    name: 'messageDelete',
    async run({ events: [message] }) {
        if (!message.guild
            || message.author?.bot
            || !message.content
            || this.client.mainGuild.id !== message.guild.id
            || process.env.ENV == 'DEV'
        ) return;

        const logChannel = this.client.mainGuild.deleteLogChannel;
        if (!logChannel) return;

        return await logChannel.send({
            embeds: [embed.red({
                author: {
                    name: message.author!.username,
                    icon_url: message.author?.displayAvatarURL()
                },
                description: `🗑️ **Message supprimé dans <#${message.channel.id}>**`,
                fields: [{
                    name: 'Contenu',
                    value: message.content.slice(0, 1024)
                }],
                footer: {
                    text: `UID: ${message.author!.id}`
                },
                timestamp: new Date().toISOString()
            })]
        });
    }
})