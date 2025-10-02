import { Command } from '@/structures/Command'

import { memberService } from '@/database/services'
import { mainGuildConfig } from '@/client/config'

import { EmbedUI } from '@/ui/EmbedUI'

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
    const { member } = await memberService.findOrCreate(userId, guildId);

    if (member.bank < 1) {
        return await reply({
            embeds: [
                EmbedUI.createMessage(`❌ Vous n'avez rien à retirer de la banque !`, { color: 'red' })
            ]
        });
    }

    let amount: number;

    if (amountInput.toLowerCase() === 'all') {
        amount = member.bank;
    } else {
        amount = Math.min(member.bank, parseInt(amountInput));
        if (isNaN(amount) || amount <= 0) {
            return reply({
                embeds: [
                    EmbedUI.createMessage(`❌ Montant invalide`, { color: 'red' })
                ],
            });
        }
    }

    if (member.bank < amount) {
        return reply({
            embeds: [
                EmbedUI.createMessage({
                    color: 'red',
                    title: '❌ Fonds insuffisants',
                    description: `Tu n'as que **${member.bank}** pièces en banque.`,
                })
            ]
        });
    }

    await memberService.updateOrCreate(userId, guildId, {
        update: {
            bank: { decrement: amount },
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
