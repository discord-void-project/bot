import { Command } from '@/structures/Command'
import { ApplicationCommandOptionType, MessageFlags } from 'discord.js'

import { memberService } from '@/database/services/v2/member'
import { mainGuildConfig } from '@/client/config'
import { createCooldown } from '@/utils'
import { EmbedUI } from '@/ui/EmbedUI'
import { memberBankService } from '@/database/services/member-bank-service'
import db from '@/database/db'

const SUCCESS_CHANCE = 0.3;
const STEAL_PERCENTAGE = 0.20;

export default new Command({
    nameLocalizations: {
        fr: 'voler'
    },
    description: 'rob',
    descriptionLocalizations: {
        fr: 'voler'
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'target',
                name_localizations: {
                    fr: 'cible'
                },
                description: 'The member you want to rob',
                description_localizations: {
                    fr: 'Le membre que vous voulez voler'
                },
                required: true
            },
        ],
    },
    messageCommand: {
        style: 'flat',
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        const targetUser = interaction.options.getUser('target', true);
        const robberId = interaction.user.id;
        const guildId = interaction.guild!.id;

        if (targetUser.bot) {
            return interaction.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'red',
                        title: '🤖 Impossible de voler un bot'
                    })
                ],
                flags: MessageFlags.Ephemeral
            });
        }

        if (targetUser.id === robberId) {
            return interaction.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'red',
                        title: '🙃 Tu ne peux pas te voler toi-même'
                    })
                ],
                flags: MessageFlags.Ephemeral
            });
        }

        let robber = await memberService.findOrCreate({
            userId: robberId,
            guildId
        });

        const COOLDOWN = 60 * 60 * 1000;

        const { isActive } = createCooldown(robber.lastRobAt, COOLDOWN);

        if (isActive) {
            return interaction.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'red',
                        title: '⏳ Cooldown',
                        description: `Tu dois attendre **1h** avant de voler à nouveau !`,
                    }),
                ],
                flags: MessageFlags.Ephemeral
            });
        }

        const robberBank = await memberBankService.findOrCreate(robberId, guildId);

        robber = await memberService.findOrCreate({
            userId: robberId,
            guildId
        });

        const target = await memberService.findOrCreate({
            userId: targetUser.id,
            guildId
        });

        const success = Math.random() < SUCCESS_CHANCE;
        const stolenAmount = Math.floor(target.guildPoints * STEAL_PERCENTAGE);

        if (success) {
            db.$transaction(async (tx) => {
                const ctx = Object.create(memberService, {
                    model: { value: tx.member }
                });

                await memberService.setLastRobedAt.call(ctx, {
                    userId: robberId,
                    guildId
                });

                await memberService.addGuildPoints.call(ctx, {
                    userId: robberId,
                    guildId,
                    amount: stolenAmount
                });

                await memberService.removeGuildPoints.call(ctx, {
                    userId: targetUser.id,
                    guildId,
                    amount: stolenAmount
                });
            });

            return interaction.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'green',
                        title: '🕵️‍♂️ Vol réussi !',
                        description: `Tu as volé **${stolenAmount}** pièces à **${targetUser.username}** !`,
                    }),
                ],
            });
        } else {

            throw Error('NOT FINISH : ROB')
            // const totalAssets = robber.coins + robberBank.funds;
            // const penalty = Math.floor(totalAssets * 0.02);

            // let remainingPenalty = penalty;

            // const coinsDecrement = Math.min(robber.coins, remainingPenalty);
            // remainingPenalty -= coinsDecrement;

            // const bankDecrement = Math.min(robberBank.funds, remainingPenalty);
            // remainingPenalty -= bankDecrement;

            // await memberService.updateOrCreate(robberId, guildId, {
            //     update: {
            //         coins: { decrement: coinsDecrement },
            //         bank: {
            //             update: {
            //                 funds: {
            //                     decrement: bankDecrement
            //                 }
            //             }
            //         },
            //         lastRobAt: new Date(),
            //     },
            // });

            return interaction.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'red',
                        title: '🚨 Vol échoué !',
                        description: `Tu t'es fait attraper et tu perds **${coinsDecrement + bankDecrement}** pièces en amende !`,
                    }),
                ],
            });
        }
    }
})