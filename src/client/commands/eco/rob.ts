import { ApplicationCommandOptionType, MessageFlags } from 'discord.js'
import { Command } from '@/structures/Command'

import db from '@/database/db'
import { memberService } from '@/database/services'

import { createCooldown } from '@/utils'
import { EmbedUI } from '@/ui/EmbedUI'

import { mainGuildConfig } from '@/client/config'

const SUCCESS_CHANCE = 0.3;
const STEAL_PERCENTAGE = 0.20;
const ROB_COOLDOWN = 60 * 60 * 1000;
const ROBBED_COOLDOWN = 3 * 60 * 60 * 1000;

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
        const guildId = interaction.guild.id;

        const robberKey = {
            userId: robberId,
            guildId,
        }

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

        let robber = await memberService.findOrCreate(robberKey);

        const { isActive: canRob } = createCooldown(robber.lastRobAt, ROB_COOLDOWN);
        if (canRob) {
            return await interaction.reply({
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

        // const robberVault = await memberBankService.findOrCreate(robberId, guildId);

        const targetKey = {
            userId: targetUser.id,
            guildId
        }

        const target = await memberService.findOrCreate(targetKey);

        if (!target.guildCoins) {
            return await interaction.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'orange',
                        description: `Cette personne n'a pas l'air riche, je devrais changer de cible`,
                    }),
                ],
                flags: MessageFlags.Ephemeral
            });
        }

        const { isActive: isAlreadyRobbed } = createCooldown(target.lastRobbedAt, ROBBED_COOLDOWN);
        if (isAlreadyRobbed) {
            return await interaction.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'orange',
                        description: `Mhhh.. On dirait bien que cette personne es vigilante, essayons plus tard 🤔`,
                    }),
                ],
                flags: MessageFlags.Ephemeral
            });
        }

        const success = Math.random() < (SUCCESS_CHANCE);

        await memberService.setLastRobAt(robberKey);
        await memberService.setLastRobbedAt(targetKey);

        if (success) {
            const stolenAmount = Math.floor(target.guildCoins * STEAL_PERCENTAGE);

            await db.$transaction(async (tx) => {
                const ctx = Object.create(memberService, {
                    model: { value: tx.member }
                });

                await memberService.addGuildCoins.call(ctx, robberKey, stolenAmount);
                await memberService.removeGuildCoins.call(ctx, targetKey, stolenAmount);
            });

            return await interaction.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'green',
                        title: '🕵️‍♂️ Vol réussi !',
                        description: `Tu as volé **${stolenAmount}** pièces à **${targetUser.username}** !`,
                    }),
                ],
            });
        } else {
            const { total } = await memberService.getTotalGuildCoins(robberKey);
            const penalty = Math.floor(total * 0.02);

            await memberService.removeGuildCoinsWithVault(robberKey, penalty);

            return interaction.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'red',
                        title: '🚨 Vol échoué !',
                        description: `Tu t'es fait attraper et tu perds **${penalty}** pièces en amende !`,
                    }),
                ],
            });
        }
    }
})