import { Command } from '@/structures/Command'
import { EmbedUI } from '@/ui/EmbedUI'

export default new Command({
    access: {
        user: {
            isDeveloper: true
        }
    },
    messageCommand: {
        style: 'slashCommand'
    },
    async onMessage(message) {
        const voiceSessions = this.client.voiceSessions;
        const totalSessions = voiceSessions.size;
        const inSession = voiceSessions.has(message.author.id);

        const sampleSessions = [...voiceSessions.entries()].slice(0, 10);

        return await message.reply({
            embeds: [
                EmbedUI.create({
                    color: 'indigo',
                    title: '🔍 Debug des sessions vocales',
                    fields: [
                        {
                            name: '📊 Nombre total de sessions',
                            value: `\`${totalSessions}\``,
                            inline: true
                        },
                        {
                            name: '🙋‍♂️ Présent en session ?',
                            value: inSession ? '✅ Oui' : '❌ Non',
                            inline: true
                        },
                        {
                            name: '🆔 Aperçu des sessions',
                            value: sampleSessions.length > 0
                                ? sampleSessions
                                    .map(([id, session]) => 
                                        `\`${id}\` • ⏱️ <t:${Math.floor(session.timestamp / 1000)}:R>`
                                    )
                                    .join('\n')
                                : 'Aucune session est actuellement actif'
                        }
                    ],
                    footer: {
                        text: sampleSessions.length < totalSessions 
                            ? `Seulement ${sampleSessions.length} / ${totalSessions} affichées` 
                            : 'Toutes les sessions sont affichées'
                    }
                })
            ]
        });
    }
});
