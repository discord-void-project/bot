import { Command } from '@/structures/Command'
import { ButtonInteraction, GuildMember, MessageFlags } from 'discord.js'

import { memberService, shopItemService } from '@/database/services'
import { mainGuildConfig } from '@/client/config'

import { actionRow, button, selectMenu, separator, textDisplay } from '@/ui/components'
import useEmojis from '@/ui/useEmojis'
import container from '@/ui/container'
import embed from '@/ui/embed'

import { formatCompactNumber } from '@/utils'

export default new Command({
    nameLocalizations: {
        fr: 'boutique'
    },
    description: 'Shop',
    descriptionLocalizations: {
        fr: 'Boutique'
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        const member = interaction.member as GuildMember

        const { yellowArrowEmoji } = useEmojis();

        const allItems = await shopItemService.findMany(interaction.guild!.id);

        if (!allItems.length) {
            return await interaction.reply({
                embeds: [
                    embed.red(`Aucun article à vendre pour le moment`)
                ]
            });
        }

        const itemsPerPage = 5;
        const maxPages = Math.ceil(allItems.length / itemsPerPage);

        const getMemberBalance = async () => {
            const { member: memberRecord } = await memberService.findOrCreate(interaction.user.id, interaction.guild!.id) ?? {
                memberRecord: {
                    coins: 0,
                    bank: 0
                }
            };

            return {
                coins: memberRecord.coins,
                bank: memberRecord.bank,
                total: memberRecord.coins + memberRecord.bank
            }
        }

        const generateComponents = async (page: number) => {
            const { total } = await getMemberBalance();

            const items = allItems
                .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
                .sort((a, b) => b.cost - a.cost);

            const optionsItem = await Promise.all(
                items.map(async (item) => {
                    const role = await interaction.guild?.roles.fetch(item.roleId);
                    const isStockEpuised = typeof item.stock === 'number' && item.stock <= 0;

                    return {
                        label: role?.name ?? 'Deleted Role',
                        description: isStockEpuised
                            ? `🛑 Rupture de stock`
                            : `🏷️ ${formatCompactNumber(item.cost)}`,
                        value: item.id.toString(),
                    }
                })
            );

            return [
                container.orange({
                    components: [
                        textDisplay(`## Boutique de ${interaction.guild!.name}`),
                        (maxPages - 1) > 0 && textDisplay(`-# Page ${page + 1} / ${maxPages}`),
                        textDisplay(`-# Mon solde total **${total}** 💰`),
                        separator(),
                        ...items.map((item) => {
                            const isStockEpuised = typeof item.stock === 'number' && item.stock <= 0;

                            return textDisplay([
                                `- **${isStockEpuised ? `~~<@&${item.roleId}>~~` : `<@&${item.roleId}>`}**`,
                                typeof item.stock === 'number' && `**↳** 📦 Stock  ${yellowArrowEmoji} **${isStockEpuised ? 'Épuisé' : item.stock}**`,
                                `**↳** 🏷️ Prix ${yellowArrowEmoji} **${formatCompactNumber(item.cost)}**`,
                            ].filter(Boolean).join('\n'));
                        }),
                        separator(),
                        actionRow([
                            selectMenu.string({
                                custom_id: 'selectItem',
                                placeholder: 'Choisissez un article à acheter',
                                options: optionsItem
                            })
                        ]) as any,
                        ((page > 0) || ((maxPages - 1) > page)) && actionRow([
                            page > 0 && {
                                type: 2,
                                style: 2,
                                label: '◀️ Page précédente',
                                custom_id: `shop_prev`,
                            } as any,
                            ((maxPages - 1) > page) && {
                                type: 2,
                                style: 2,
                                label: '▶️ Page suivante',
                                custom_id: `shop_next`,
                            } as any
                        ].filter(Boolean))
                    ].filter(Boolean)
                })
            ];
        };

        let currentPage = 0;

        const msg = await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: await generateComponents(currentPage)
        });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 60_000
        });

        collector.on('collect', async (i) => {
            collector.resetTimer();

            const refreshPayload = async () => {
                return await i.update({
                    components: await generateComponents(currentPage)
                });
            }

            if (i instanceof ButtonInteraction) {
                if (i.customId === 'shop_prev' && currentPage > 0) {
                    currentPage--;
                } else if (i.customId === 'shop_next' && currentPage < maxPages - 1) {
                    currentPage++;
                }

                return await refreshPayload();
            } else {
                const item = allItems.find((item) => item.id.toString() == i.values[0]);
                if (!item) {
                    await refreshPayload();

                    return await i.followUp({
                        flags: MessageFlags.Ephemeral,
                        embeds: [
                            embed.red(`Une erreur est survenu, l'article est introuvable :/`)
                        ]
                    })
                }

                if (typeof item.stock === 'number' && item.stock < 1) {
                    await refreshPayload();

                    return await i.followUp({
                        flags: MessageFlags.Ephemeral,
                        embeds: [
                            embed.red(`Cet article n'est plus en stock !`)
                        ]
                    });
                }

                if (member.roles.cache.has(item.roleId)) {
                    await refreshPayload();

                    return await i.followUp({
                        flags: MessageFlags.Ephemeral,
                        embeds: [
                            embed.red(`Vous avez déjà acheter ce rôle !`)
                        ]
                    });

                }

                const { total } = await getMemberBalance();

                if (total < item.cost) {
                    await refreshPayload();

                    return await i.followUp({
                        flags: MessageFlags.Ephemeral,
                        embeds: [
                            embed.red(`Vous n'avez pas assez d'argent pour acheter cet article !`)
                        ]
                    });
                }

                const msg = await i.update({
                    components: [
                        container.orange({
                            components: [
                                textDisplay(`Confirmer vous l'achat de l'article " <@&${item?.roleId}> " ?`),
                                separator(),
                                actionRow([
                                    button.green('Confirmer', { custom_id: '#confirm' }),
                                    button.red('Annuler', { custom_id: '#cancel' }),
                                ])
                            ]
                        })
                    ]
                });

                try {
                    const confirm = await msg.awaitMessageComponent({
                        filter: ($i) => $i.user.id === i.user.id,
                        time: 15_000,
                    });

                    if (confirm.customId === '#confirm') {
                        await memberService.pay(member.user.id, member.guild.id, item.cost, {
                            coins: true,
                            bank: true
                        });

                        for (const item of allItems.filter((f) => member.roles.cache.has(f.roleId))) {
                            await member.roles.remove(item.roleId);
                        }

                        await member.roles.add(item.roleId);
                    }
                } catch (ex) {
                    // 
                } finally {
                    return await msg.edit({
                        components: await generateComponents(currentPage)
                    });
                }
            }
        });

        collector.on('end', async (i) => {
            return await interaction.editReply({
                components: [
                    container.orange('Les **60** secondes sont écoulées 💡')
                ]
            });
        });
    }
})