import { Command } from '@/structures/Command'

import { memberService } from '@/database/services'
import { mainGuildConfig } from '@/client/config'
import { formatCompactNumber } from '@/utils'
import embed from '@/ui/embed'

const MAX_BANK = 50000;

interface HandleDepositContext {
    userId: string;
    guildId: string;
    username: string;
    amountInput: string;
    reply: (data: any) => Promise<any>;
}

const handleDepositCommand = async ({
    userId,
    guildId,
    amountInput,
    reply,
}: HandleDepositContext) => {
    const { member } = await memberService.findOrCreate(userId, guildId);

    if (member.coins < 1) {
        return await reply({
            embeds: [embed.red(`❌ Vous n'avez rien à déposer en banque !`)]
        });
    }

    let amount: number;

    if (amountInput.toLowerCase() === 'all') {
        amount = member.coins;
    } else {
        amount = Math.min(member.coins, parseInt(amountInput));
        if (isNaN(amount) || amount <= 0) {
            return await reply({
                embeds: [embed.red(`❌ Montant invalide`)],
            });
        }
    }

    if (member.coins < amount) {
        return await reply({
            embeds: [embed.red({
                title: '❌ Fonds insuffisants',
                description: `Tu n'as que **${member.coins}** pièces dans ton portefeuille.`,
            })],
        });
    }

    if (member.bank + amount > MAX_BANK) {
        const maxDeposit = MAX_BANK - member.bank;
        if (maxDeposit <= 0) {
            return await reply({
                embeds: [embed.red(`❌ Ta banque est déjà pleine, c'est **${formatCompactNumber(MAX_BANK)}** le max :(`)],
            });
        } else {
            amount = maxDeposit;
        }
    }

    await memberService.updateOrCreate(userId, guildId, {
        update: {
            coins: { decrement: amount },
            bank: { increment: amount },
        },
    });

    return await reply({
        embeds: [embed.green({
            title: '🏦 Dépôt effectué',
            description: `Tu as déposé **${amount}** pièces dans ta banque.`,
        })],
    });
};

export default new Command({
    description: 'Deposit money from your wallet to your bank',
    nameLocalizations: {
        fr: 'déposer'
    },
    descriptionLocalizations: {
        fr: 'Dépose des pièces de ton portefeuille vers ta banque'
    },
    slashCommand: {
        arguments: [
            {
                type: 3,
                name: 'amount',
                description: 'The amount to deposit or "all"',
                required: true,
            }
        ]
    },
    messageCommand: {
        style: 'flat',
        aliases: ['deposit', 'dep'],
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

        return await handleDepositCommand({
            userId: interaction.user.id,
            guildId: interaction.guild!.id,
            username: interaction.user.globalName ?? interaction.user.username,
            amountInput,
            reply: (data) => interaction.reply(data)
        });
    },
    async onMessage(message, { args }) {
        const amountInput = args[0];

        if (!amountInput) {
            return message.reply({
                embeds: [embed.red({
                    title: '❌ Utilisation incorrecte',
                    description: 'Exemple : `v!deposit 100` ou `v!deposit all`'
                })]
            });
        }

        return await handleDepositCommand({
            userId: message.author.id,
            guildId: message.guild!.id,
            username: message.author.globalName ?? message.author.username,
            amountInput,
            reply: (data) => message.reply(data)
        });
    }
});