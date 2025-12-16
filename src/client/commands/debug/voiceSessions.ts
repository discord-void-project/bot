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
        const voiceSessions = this.client.callSessions.cache;
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
                                    .map(([id, session]) => {
                                        const member = this.client.users.cache.get(id);

                                        const flags = session.flags;

                                        const statusEmojis = [
                                            flags.isDeaf ? '🙉' : flags.isMuted ? '🙊' : '🔊',
                                            flags.isPrivate ? '🔒' : '🌐',
                                            flags.isStreaming ? '🎥' : '',
                                            flags.hasCamera ? '📹' : '',
                                        ].filter(Boolean).join(' ');

                                        const timeAgo = `<t:${Math.floor(session.timestamp / 1000)}:R>`;

                                        return `\`${member?.username ?? 'Unknown'}\` (${id}) • ${statusEmojis} • ⏱️ ${timeAgo}`;
                                    })
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
