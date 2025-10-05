import { Command } from '@/structures/Command'
import { memberService, userService } from '@/database/services'

import { ApplicationCommandOptionType, MessageFlags } from 'discord.js'
import { memberBankService } from '@/database/services'

import { createButton, createSection, createSeparator, createTextDisplay } from '@/ui/components/common'
import { ContainerUI } from '@/ui'

import { applicationEmojiHelper } from '@/helpers'
import { formatCompactNumber } from '@/utils'

const UPGRADE_DISCOUNT = 0.15;

export default new Command({
    nameLocalizations: {
        fr: 'améliorer'
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.String,
                name: 'type',
                description: 'Type d’amélioration',
                choices: [
                    {
                        name: 'bank',
                        name_localizations: { fr: 'banque' },
                        value: 'bank'
                    }
                ],
                required: true
            }
        ]
    },
    async onInteraction(interaction) {
        const { whiteArrowEmoji } = applicationEmojiHelper();

        const upgradeType = interaction.options.getString('type');

        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        switch (upgradeType) {
            case 'bank': {
                const { member } = await memberService.findOrCreate(userId, guildId);
                const memberBank = await memberBankService.findOrCreate(userId, guildId);
                const totalFunds = member.coins + memberBank.funds;

                const baseNextTier = await memberBankService.getNextTier(userId, guildId);
                const tagBoostValue = await userService.getTagBoost(userId);
                const discount = tagBoostValue * UPGRADE_DISCOUNT;

                const nextTier = baseNextTier
                    ? {
                        ...baseNextTier,
                        baseCost: baseNextTier.cost,
                        cost: Math.floor(baseNextTier.cost * (1 - discount))
                    }
                    : null;

                const loadComponents = async () => {
                    const { member } = await memberService.findOrCreate(userId, guildId);
                    const memberBank = await memberBankService.findOrCreate(userId, guildId);
                    const totalFunds = member.coins + memberBank.funds;

                    const baseNextTier = await memberBankService.getNextTier(userId, guildId);
                    const tagBoostValue = await userService.getTagBoost(userId);
                    const discount = tagBoostValue * UPGRADE_DISCOUNT;

                    const nextTier = baseNextTier
                        ? {
                            ...baseNextTier,
                            baseCost: baseNextTier.cost,
                            cost: Math.floor(baseNextTier.cost * (1 - discount))
                        }
                        : null;

                    const currentTierLevel = memberBank.tier.split('_')[1] ?? '?';

                    const upgradeButton = nextTier
                        ? createButton('Améliorer', {
                            color: 'green',
                            customId: 'upgrade',
                            disabled: nextTier.cost > totalFunds
                        })
                        : createButton('MAX', 'upgrade', { color: 'gray', disabled: true });

                    return [
                        ContainerUI.create({
                            color: 'orange',
                            components: [
                                createTextDisplay('## Amélioration de la banque'),
                                createTextDisplay("> 💡 Améliorer la banque permet d'augmenter la capacité d'argent maximum"),
                                createSeparator(),
                                createSection({
                                    accessory: upgradeButton,
                                    components: [
                                        createTextDisplay(`## **Nv. ${currentTierLevel}**`),
                                        createTextDisplay([
                                            nextTier && `💰 Coût ${whiteArrowEmoji} ${discount
                                                ? `~~${formatCompactNumber(nextTier.baseCost)}~~ **${formatCompactNumber(nextTier.cost)} -${(discount * 100).toFixed(2)}%**`
                                                : `**${formatCompactNumber(nextTier.baseCost)}**`}`,
                                            nextTier
                                                ? `📦 Capacité ${whiteArrowEmoji} **${formatCompactNumber(memberBank.maxCapacity)}** ➜ **${formatCompactNumber(nextTier.capacity)}**`
                                                : `📦 Capacité ${whiteArrowEmoji} **${formatCompactNumber(memberBank.maxCapacity)}**`
                                        ].filter(Boolean).join('\n')),
                                    ]
                                }),
                            ]
                        })
                    ];
                };

                const msg = await interaction.reply({
                    flags: MessageFlags.IsComponentsV2,
                    components: await loadComponents()
                });

                if (!nextTier || nextTier.cost > totalFunds) return;

                const collector = msg.createMessageComponentCollector({
                    filter: (i) => i.user.id === userId,
                    time: 60_000
                });

                collector.on('collect', async (i) => {
                    collector.resetTimer();

                    await memberBankService.upgradeTier(userId, guildId);
                    await memberService.pay(userId, guildId, nextTier.cost, {
                        bank: true,
                        coins: true
                    });

                    return await i.update({ components: await loadComponents() });
                });

                collector.on('end', async () => {
                    await msg.edit({
                        components: [
                            ContainerUI.create({
                                color: 'orange',
                                components: [createTextDisplay('⏳ Temps écoulé')]
                            })
                        ]
                    });
                });

                break;
            }

            default: {
                return await interaction.reply({
                    content: '❓ Type d’amélioration invalide',
                    ephemeral: true
                })
            }
        }
    }
})
