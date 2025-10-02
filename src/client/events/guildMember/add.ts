import { Event } from '@/structures'
import { guildService } from '@/database/services'

import { actionRow, button } from '@/ui/components'
import embed from '@/ui/embed'

export default new Event({
    name: 'guildMemberAdd',
    async run({ events: [member] }) {
        if (process.env.ENV === 'DEV') return;

        const guild = member.guild;

        if (member.bannable && guild.safetyAlertsChannel) {
            const blacklist = await guildService.findUser(member.id);
            if (blacklist) {
                const guildBlacklist = await guildService.findUserGuildBlacklist(guild.id, member.id);
                if (!guildBlacklist?.accepted) {
                    await member.ban({
                        reason: blacklist.reason ?? 'Aucune raisons spécifiée'
                    });

                    return await guild.safetyAlertsChannel.send({
                        content: `Oulah, il y a un membre qui a tenté de rejoindre mais il est sur mes listes noir du coup je l'ai banni, veux-tu que je l'autorise quand-même ?`,
                        embeds: [
                            embed.orange({
                                title: '🕵️ info sur le membre blacklisté',
                                fields: [
                                    {
                                        name: '👤 Utilisateur',
                                        value: `<@${member.id}> (\`${member.id}\`)`,
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
                        ],
                        components: [
                            actionRow([
                                button.green('Autoriser', { custom_id: `bl_authorize_${member.id}` }),
                            ])
                        ]
                    })
                }
            }
        }

        if (this.client.mainGuild.id === guild.id) {
            await this.client.mainGuild.welcomeChannel.send({
                embeds: [
                    embed.indigo({
                        title: '˗ˏˋ ★ ˎˊ˗ Nouvelle invocation  ˗ˏˋ ★ ˎˊ˗',
                        description: [
                            `· · ─ ·✦· ─ · ·`,
                            `Bienvenue ${member} sur **Lunaria** !! ☆ ᶻ 𝗓 𐰁`,
                            `╰┈➤ J'espère que tu vas te plaire parmi nous ! :)`,
                            `Merci de lire le <#1282786070907584604> avant de discuter ! Merci ! ⋆｡°✩`,
                            `⁺⋆₊✧───────────✩₊⁺⋆☾⋆⁺₊✧───────────✩₊⁺⋆⁺`,
                        ].join('\n'),
                        thumbnail: {
                            url: member.user.avatarURL() ?? member.user.defaultAvatarURL,
                        },
                        image: {
                            url: 'https://i.pinimg.com/originals/cd/0a/c5/cd0ac53c65a93a2ccfabb720e1dcb0fe.gif'
                        },
                        timestamp: new Date().toISOString()
                    })
                ]
            }).then(async (msg) => await msg.react('🌠'))
        }
    }
});
