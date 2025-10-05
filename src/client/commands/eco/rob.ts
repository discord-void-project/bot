import { Command } from '@/structures/Command'
import { ApplicationCommandOptionType, MessageFlags } from 'discord.js'

import { memberService } from '@/database/services'
import { mainGuildConfig } from '@/client/config'
import { createCooldown } from '@/utils'
import { EmbedUI } from '@/ui/EmbedUI'
import { memberBankService } from '@/database/services/memberBankService'

const SUCCESS_CHANCE = 0.2;
const STEAL_PERCENTAGE = 0.25;

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

        const { member } = await memberService.findOrCreate(robberId, guildId);

        const COOLDOWN = 60 * 60 * 1000;

        const { isActive } = createCooldown(member.lastRobAt, COOLDOWN);

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

        const { member: robber } = await memberService.findOrCreate(robberId, guildId);
        const { member: target } = await memberService.findOrCreate(targetUser.id, guildId);

        const success = Math.random() < SUCCESS_CHANCE;
        const stolenAmount = Math.floor(target.coins * STEAL_PERCENTAGE);

        if (success) {
            await memberService.updateOrCreate(robberId, guildId, {
                update: {
                    coins: { increment: stolenAmount },
                    lastRobAt: new Date()
                },
            });

            await memberService.updateOrCreate(targetUser.id, guildId, {
                update: {
                    coins: { decrement: stolenAmount },
                },
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
            const totalAssets = robber.coins + robberBank.funds;
            const penalty = Math.floor(totalAssets * 0.02);

            let remainingPenalty = penalty;

            const coinsDecrement = Math.min(robber.coins, remainingPenalty);
            remainingPenalty -= coinsDecrement;

            const bankDecrement = Math.min(robberBank.funds, remainingPenalty);
            remainingPenalty -= bankDecrement;

            await memberService.updateOrCreate(robberId, guildId, {
                update: {
                    coins: { decrement: coinsDecrement },
                    bank: {
                        update: {
                            funds: {
                                decrement: bankDecrement
                            }
                        }
                    },
                    lastRobAt: new Date(),
                },
            });

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