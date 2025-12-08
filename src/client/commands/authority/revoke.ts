import { Command } from '@/structures/Command'

import { userService } from '@/database/services'
import { PrismaUserFlags, PrismaUserFlagsString } from '@/database/utils'

import { createActionRow, createButton } from '@/ui/components/common'
import { EmbedUI } from '@/ui/EmbedUI'

import { parseUserMention } from '@/utils'

export default new Command({
    access: {
        user: {
            isDeveloper: true
        }
    },
    messageCommand: {
        style: 'slashCommand'
    },
    async onMessage(message, { args: [grade, userId] }) {
        userId = parseUserMention(userId) ?? userId ?? message.author.id;

        if (!grade) return await message.reply({
            embeds: [
                EmbedUI.createMessage({
                    color: 'red',
                    title: '❌ Erreur de retrait d’autorité',
                    description: "Tu dois préciser quelle autorité retirer, sinon je ne peux rien faire ^^'"
                })
            ]
        });

        const flagName = grade.toUpperCase() as PrismaUserFlagsString;
        if (!(flagName in PrismaUserFlags)) return await message.reply({
            embeds: [
                EmbedUI.createMessage({
                    color: 'red',
                    title: '❌ Erreur de retrait d’autorité',
                    description: `Je ne connais pas cette autorité, voici ceux que je reconnais **${Object.keys(PrismaUserFlags).join(', ')}**`
                })
            ]
        });

        const userDatabase = await userService.findOrCreate(userId);
        if (!userDatabase.flags.has(flagName)) return await message.reply({
            embeds: [
                EmbedUI.createMessage({
                    color: 'red',
                    title: '❌ Erreur de retrait d’autorité',
                    description: `<@${userId}> \`(${userId})\` ne possède pas l’autorité **${flagName}**, donc je ne peux pas la retirer 🤔`
                })
            ]
        });

        await userService.removeFlag(userId, flagName);

        const msg = await message.reply({
            content: `Parfait, j'ai retiré l'autorité **${flagName}** à <@${userId}> \`(${userId})\` !`,
            embeds: [
                EmbedUI.createMessage({
                    color: 'green',
                    title: "✅ Autorité retirée avec succès",
                    fields: [
                        {
                            name: 'Autorité',
                            value: `\`${flagName}\``,
                        },
                        {
                            name: 'Utilisateur',
                            value: [
                                `- <@${userId}>`,
                                `- \`${userId}\``
                            ].join('\n'),
                        }
                    ],
                    timestamp: new Date().toISOString(),
                })
            ],
            components: [
                createActionRow([
                    createButton('Prévenir en DM', { color: 'blue', customId: 'dm-user' })
                ])
            ]
        });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 15_000
        });

        collector.on('collect', async (i) => {
            await i.update({ components: [] });
            await i.followUp({
                content: `J'ai prévenu, la personne en DM ! :)`,
            });

            const DM = await this.client.users.createDM(userId);
            if (DM.isSendable()) return await DM.send({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'purple',
                        title: "🔑 Retrait d'autorité",
                        description: `Salut, je viens t’informer que ton autorité **${flagName}** a été retirée, merci encore pour ton implication jusque-là 💙`,
                        timestamp: new Date().toISOString(),
                    })
                ],
            });
        });

        collector.on('end', async () => {
            return await msg.edit({
                components: []
            });
        });
    }
})