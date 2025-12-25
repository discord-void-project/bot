import { ApplicationCommandOptionType, MessageFlags } from 'discord.js'
import { Command } from '@/structures/Command'

import db from '@/database/db'
import { guildModuleService, memberService } from '@/database/services'

import { createCooldown, formatTimeLeft } from '@/utils'
import { EmbedUI } from '@/ui/EmbedUI'

export default new Command({
    nameLocalizations: {
        fr: 'voler'
    },
    description: '🕵️ Attempt to steal coins from another player',
    descriptionLocalizations: {
        fr: '🕵️ Tenter de voler des pièces à un autre joueur'
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
            modules: {
                eco: {
                    isRobEnabled: true
                }
            }
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
        const { settings: ecoSettings } = await guildModuleService.findOrCreate({
            guildId,
            moduleName: 'eco'
        });

        const { isActive: canRob, expireTimestamp } = createCooldown(robber.lastRobAt, ecoSettings.robCooldown);
        if (canRob) {
            return await interaction.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'red',
                        title: '⏳ Cooldown',
                        description: `Tu dois attendre ${formatTimeLeft(expireTimestamp)} avant de voler à nouveau !`,
                    }),
                ],
                flags: MessageFlags.Ephemeral
            });
        }

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

        const { isActive: isAlreadyRobbed } = createCooldown(target.lastRobbedAt, ecoSettings.robbedCooldown);
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

        const success = Math.random() < (ecoSettings.robSuccessChance);

        await memberService.setLastRobAt(robberKey);
        await memberService.setLastRobbedAt(targetKey);

        if (success) {
            const stolenAmount = Math.floor(target.guildCoins * ecoSettings.robStealPercentage);

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
                        description: `Tu as volé **${stolenAmount.toLocaleString('en')}** pièces à **${targetUser.username}** !`,
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
                        description: `Tu t'es fait attraper et tu perds **${penalty.toLocaleString('en')}** pièces en amende !`,
                    }),
                ],
            });
        }
    }
})