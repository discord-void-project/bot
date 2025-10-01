import { Command } from '@/structures/Command'

import { memberService } from '@/database/services'
import { mainGuildConfig } from '@/client/config'
import { formatCompactNumber } from '@/utils'
import { EmbedUI } from '@/ui/EmbedUI'

interface HandleWalletContext {
    userId: string;
    guildId: string;
    username: string;
    reply: (data: any) => Promise<any>;
}

const handleWalletCommand = async ({
    userId,
    guildId,
    username,
    reply
}: HandleWalletContext) => {
    const { member } = await memberService.findOrCreate(userId, guildId);

    return reply({
        embeds: [
            EmbedUI.createMessage({
                color: 'green',
                title: `Solde de ${username}`,
                description: [
                    `🏦 **${formatCompactNumber(member.bank)}** en banque`,
                    `💶 **${formatCompactNumber(member.coins)}** en poche`
                ].join('\n')
            })
        ]
    });
};

export default new Command({
    description: 'View your wallet balance',
    nameLocalizations: {
        fr: 'portefeuille'
    },
    descriptionLocalizations: {
        fr: 'Affiche ton solde de portefeuille'
    },
    messageCommand: {
        style: 'flat',
        aliases: [
            'wallet',
            'balance',
            'bal'
        ]
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        return handleWalletCommand({
            userId: interaction.user.id,
            guildId: interaction.guild!.id,
            username: interaction.user.globalName ?? interaction.user.username,
            reply: (data) => interaction.reply(data)
        });
    },
    async onMessage(message) {
        return handleWalletCommand({
            userId: message.author.id,
            guildId: message.guild!.id,
            username: message.author.globalName ?? message.author.username,
            reply: (data) => message.reply(data)
        });
    }
});
