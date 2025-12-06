import { Command } from '@/structures/Command'

import { memberService } from '@/database/services'
import { mainGuildConfig } from '@/client/config'

import { EmbedUI } from '@/ui/EmbedUI'
import { memberBankService } from '@/database/services/member-bank-service';

interface HandleWithdrawContext {
    userId: string;
    guildId: string;
    username: string;
    amountInput: string;
    reply: (data: any) => Promise<any>;
}

const handleWithdrawCommand = async ({
    userId,
    guildId,
    amountInput,
    reply
}: HandleWithdrawContext) => {
    const memberBank = await memberBankService.findOrCreate(userId, guildId);
    
    if (memberBank.funds < 1) {
        return await reply({
            embeds: [
                EmbedUI.createErrorMessage(`Vous n'avez rien à retirer de la banque !`)
            ]
        });
    }

    let amount: number;

    if (amountInput.toLowerCase() === 'all') {
        amount = memberBank.funds;
    } else {
        amount = Math.min(memberBank.funds, parseInt(amountInput));
        if (isNaN(amount) || amount <= 0) {
            return reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Montant invalide`)
                ],
            });
        }
    }

    if (memberBank.funds < amount) {
        return reply({
            embeds: [
                EmbedUI.createErrorMessage({
                    title: 'Fonds insuffisants',
                    description: `Tu n'as que **${memberBank.funds}** pièces en banque :/`,
                })
            ]
        });
    }

    await memberService.updateOrCreate(userId, guildId, {
        update: {
            bank: {
                update: {
                    funds: {
                        decrement: amount
                    }
                }
            },
            coins: { increment: amount },
        },
    });

    return reply({
        embeds: [
            EmbedUI.createMessage({
                color: 'green',
                title: '🏧 Retrait effectué',
                description: `Tu as retiré **${amount}** pièces de ta banque vers ton portefeuille !`,
            })
        ]
    });
};

export default new Command({
    description: 'Withdraw money from your bank to your wallet',
    nameLocalizations: {
        fr: 'retirer'
    },
    descriptionLocalizations: {
        fr: 'Retire des pièces de la banque vers ton portefeuille'
    },
    slashCommand: {
        arguments: [
            {
                type: 3,
                name: 'amount',
                description: 'The amount to withdraw or "all"',
                required: true,
            }
        ],
    },
    messageCommand: {
        aliases: ['withdraw', 'r'],
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        const amountInput = interaction.options.getString('amount', true);

        return handleWithdrawCommand({
            userId: interaction.user.id,
            guildId: interaction.guild!.id,
            username: interaction.user.globalName ?? interaction.user.username,
            amountInput,
            reply: (data) => interaction.reply(data)
        });
    },
    async onMessage(message, { args: [amountInput] }) {
        if (!amountInput) {
            return message.reply({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'red',
                        title: '❌ Utilisation incorrecte',
                        description: `Exemple : \`${process.env.PREFIX}!withdraw 250\` ou \`${process.env.PREFIX}!withdraw all\``
                    })
                ]
            });
        }

        return handleWithdrawCommand({
            userId: message.author.id,
            guildId: message.guild!.id,
            username: message.author.globalName ?? message.author.username,
            amountInput,
            reply: (data) => message.reply(data)
        });
    }
});
