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
                    title: "❌ Erreur d'attribution d’autorité",
                    description: "Tu dois préciser quelle autorité retirer, sinon je ne peux rien faire ^^'"
                })
            ]
        });

        const flagName = grade.toUpperCase() as PrismaUserFlagsString;
        if (!(flagName in PrismaUserFlags)) return await message.reply({
            embeds: [
                EmbedUI.createMessage({
                    color: 'red',
                    title: "❌ Erreur d'attribution d’autorité",
                    description: `Je ne connais pas cette autorité, voici ceux que je reconnais **${Object.keys(PrismaUserFlags).join(', ')}**`
                })
            ]
        });

        const userDatabase = await userService.findOrCreate(userId);
        if (userDatabase.flags.has(flagName)) return await message.reply({
            embeds: [
                EmbedUI.createMessage({
                    color: 'red',
                    title: "❌ Erreur d'attribution d’autorité",
                    description: `<@${userId}> \`(${userId})\` possède déjà l’autorité **${flagName}**, donc je ne peux pas lui attribuer 🤔`
                })
            ]
        });

        await userService.addFlag(userId, flagName);

        const msg = await message.reply({
            content: `Parfait, j'ai attribué l'autorité **${flagName}** à <@${userId}> \`(${userId})\` !`,
            embeds: [
                EmbedUI.createMessage({
                    color: 'green',
                    title: "✅ Nouvelle autorité attribué",
                    fields: [
                        {
                            name: '🔑 Autorité',
                            value: `\`${flagName}\``,
                        },
                        {
                            name: '👤 Utilisateur',
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
            if (!DM.isSendable()) return;
            const messages: string[] = [
                `Hey, félicitations !! Tu viens d’obtenir l’autorité **"${flagName}"** :D\n`
            ];

            switch (flagName) {
                case 'STAFF': {
                    messages.push(
                        "👮 En tant que **Staff**, tu as désormais les **outils** nécessaires pour :",
                        "- Surveiller le serveur et assurer une **bonne ambiance**",
                        "- Gérer les signalements de **blacklist** et aider les membres"
                    );
                    break;
                }

                case 'BETA': {
                    messages.push(
                        "🧪 En tant que **Bêta-testeur**, tu as un accès privilégié qui te permet de :",
                        "- **Découvrir** et **utiliser** certaines commandes en **avant-première**",
                        "- Donner ton **avis** pour m'**améliorer**",
                    );
                    break;
                }
            }

            await DM.send({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'purple',
                        title: '🔑 Nouvelle autorité débloquée',
                        description: messages.join('\n'),
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