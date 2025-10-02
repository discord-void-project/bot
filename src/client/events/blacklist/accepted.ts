import { Event } from '@/structures'

import embed from '@/ui/embed'

export default new Event({
    name: 'blacklistAccepted',
    async run({ events: [blacklist] }) {
        const guilds = await Promise.all(
            (await this.client.guilds.fetch()).map((guild) => guild.fetch())
        );

        for (const guild of guilds) {
            const safetyChannel = guild.safetyAlertsChannel;
            if (!safetyChannel) continue;

            const member = await guild.members.fetch(blacklist.userId).catch(() => null);
            if (!member) continue;

            await safetyChannel.send({
                allowedMentions: {},
                content: "Heeya je vous partage la fiche d'un nouveau membre qui vient d'être blacklisté et qui se trouve sur le serveur",
                embeds: [
                    embed.orange({
                        title: "🕵️ Information sur l'utilisateur",
                        fields: [
                            {
                                name: '👤 Utilisateur',
                                value: `- ${member}\n- (\`${blacklist.userId}\`)`,
                                inline: true
                            },
                            {
                                name: '📄 Raison',
                                value: blacklist.reason ?? 'Aucune raison spécifiée',
                                inline: false
                            }
                        ],
                        timestamp: new Date().toISOString()
                    })
                ]
            });
        }
    }
});
