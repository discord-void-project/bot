import { Command } from '@/structures/Command'
import { ButtonInteraction, GuildMember, MessageFlags } from 'discord.js'

import { memberService, shopItemService, userService } from '@/database/services'
import { mainGuildConfig } from '@/client/config'

import { createActionRow, createButton, createSeparator, createStringSelectMenu, createTextDisplay } from '@/ui/components/common'
import { ContainerUI } from '@/ui/ContainerUI'
import { EmbedUI } from '@/ui/EmbedUI'

import { applicationEmojiHelper } from '@/helpers'
import { formatCompactNumber } from '@/utils'
import { memberBankService } from '@/database/services/member-bank-service'

const ROLE_DISCOUNT = 0.15;

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

        const { yellowArrowEmoji } = applicationEmojiHelper();

        const allItems = await shopItemService.findMany(interaction.guild!.id);

        if (!allItems.length) {
            return await interaction.reply({
                embeds: [
                    EmbedUI.createMessage(`Aucun article à vendre pour le moment`, { color: 'red' })
                ]
            });
        }

        const itemsPerPage = 5;
        const maxPages = Math.ceil(allItems.length / itemsPerPage);

        const getMemberBalance = async () => {
            const { member: memberRecord } = await memberService.findOrCreate(interaction.user.id, interaction.guild.id) ?? {
                memberRecord: {
                    coins: 0,
                }
            };

            const memberBank = await memberBankService.findOrCreate(interaction.user.id, interaction.guild.id);

            return {
                coins: memberRecord.coins,
                bank: memberBank.funds,
                total: memberRecord.coins + memberBank.funds
            }
        }

        const generateComponents = async (page: number) => {
            const { total } = await getMemberBalance();

            const tagBoostValue = await userService.getTagBoost(interaction.user.id);

            const items = allItems
                .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
                .sort((a, b) => b.cost - a.cost);

            const optionsItem = await Promise.all(
                items.map(async (item) => {
                    const role = await interaction.guild?.roles.fetch(item.roleId);
                    const isStockEpuised = typeof item.stock === 'number' && item.stock <= 0;

                    const discount = tagBoostValue * ROLE_DISCOUNT;

                    return {
                        label: role?.name ?? 'Deleted Role',
                        description: isStockEpuised
                            ? `🛑 Rupture de stock`
                            : `🏷️ ${formatCompactNumber(item.cost * (1 - discount))}`,
                        value: item.id.toString(),
                    }
                })
            );

            return [
                ContainerUI.create({
                    color: 'orange',
                    components: [
                        createTextDisplay(`## Boutique de ${interaction.guild!.name}`),
                        (maxPages - 1) > 0 && createTextDisplay(`-# Page ${page + 1} / ${maxPages}`),
                        createTextDisplay(`-# Mon solde total **${total}** 💰`),
                        createSeparator(),
                        ...items.map((item) => {
                            const isStockEpuised = typeof item.stock === 'number' && item.stock <= 0;

                            const discount = tagBoostValue * ROLE_DISCOUNT;

                            return createTextDisplay([
                                `- **${isStockEpuised ? `~~<@&${item.roleId}>~~` : `<@&${item.roleId}>`}**`,
                                typeof item.stock === 'number' && `**↳** 📦 Stock  ${yellowArrowEmoji} **${isStockEpuised ? 'Épuisé' : item.stock}**`,
                                discount
                                    ? `**↳** 🏷️ Prix ${yellowArrowEmoji} ~~${formatCompactNumber(item.cost)}~~ **${formatCompactNumber(item.cost * (1 - discount))} -${discount * 100}%**`
                                    : `**↳** 🏷️ Prix ${yellowArrowEmoji} **${formatCompactNumber(item.cost)}**`,
                            ].filter(Boolean).join('\n'));
                        }),
                        createSeparator(),
                        createActionRow([
                            createStringSelectMenu({
                                customId: 'selectItem',
                                placeholder: 'Choisissez un article à acheter',
                                options: optionsItem
                            })
                        ]) as any,
                        ((page > 0) || ((maxPages - 1) > page)) && createActionRow([
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
                            EmbedUI.createMessage(`Une erreur est survenu, l'article est introuvable :/`, { color: 'red' })
                        ]
                    })
                }

                if (typeof item.stock === 'number' && item.stock < 1) {
                    await refreshPayload();

                    return await i.followUp({
                        flags: MessageFlags.Ephemeral,
                        embeds: [
                            EmbedUI.createMessage(`Cet article n'est plus en stock !`, { color: 'red' })
                        ]
                    });
                }

                if (member.roles.cache.has(item.roleId)) {
                    await refreshPayload();

                    return await i.followUp({
                        flags: MessageFlags.Ephemeral,
                        embeds: [
                            EmbedUI.createMessage(`Vous avez déjà acheter ce rôle !`, { color: 'red' })
                        ]
                    });

                }

                const { total } = await getMemberBalance();
                const tagBoostValue = await userService.getTagBoost(interaction.user.id);

                item.cost = item.cost * ((1 - (tagBoostValue * ROLE_DISCOUNT)));

                if (total < item.cost) {
                    await refreshPayload();

                    return await i.followUp({
                        flags: MessageFlags.Ephemeral,
                        embeds: [
                            EmbedUI.createMessage(`Vous n'avez pas assez d'argent pour acheter cet article !`, { color: 'red' })
                        ]
                    });
                }

                const msg = await i.update({
                    components: [
                        ContainerUI.create({
                            color: 'orange',
                            components: [
                                createTextDisplay(`Confirmer vous l'achat de l'article " <@&${item?.roleId}> " ?`),
                                createSeparator(),
                                createActionRow([
                                    createButton('Confirmer', { color: 'green', customId: '#confirm' }),
                                    createButton('Annuler', { color: 'red', customId: '#cancel' }),
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
                    ContainerUI.createMessage('Les **60** secondes sont écoulées 💡', { color: 'orange' })
                ]
            });
        });
    }
})