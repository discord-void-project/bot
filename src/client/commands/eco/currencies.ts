import { Command } from '@/structures/Command'
import { ApplicationCommandOptionType, GuildMember } from 'discord.js'

import { memberService } from '@/database/services'

import { EmbedUI } from '@/ui/EmbedUI'

import { formatCompactNumber, parseUserMention } from '@/utils'
import { applicationEmojiHelper, guildMemberHelper } from '@/helpers'
import { memberBankService, tierCapacity } from '@/database/services/member-bank-service'

const buildEmbed = async (member: GuildMember) => {
    const { yellowSubEntryEmoji, yellowArrowEmoji } = applicationEmojiHelper();

    const userId = member.user.id;
    const guildId = member.guild.id;

    const memberHelper = await guildMemberHelper(member, { fetchAll: true });
    const memberDatabase = await memberService.find(userId, guildId) ?? {
        coins: 0,
    };
    const memberBank = await memberBankService.find(userId, guildId) ?? {
        funds: 0,
        maxCapacity: tierCapacity['TIER_0']
    };

    return EmbedUI.createMessage({
        color: 'yellow',
        thumbnail: {
            url: memberHelper.getAvatarURL()
        },
        title: `Monnaies de ${memberHelper.getName()}`,
        fields: [
            {
                name: '🪙 Coins',
                value: [
                    `${yellowSubEntryEmoji} 🏦 Banque ${yellowArrowEmoji} **${formatCompactNumber(memberBank.funds)}** / **${formatCompactNumber(memberBank.maxCapacity)}**`,
                    `${yellowSubEntryEmoji} 💶 Poche ${yellowArrowEmoji} **${formatCompactNumber(memberDatabase.coins)}**`
                ].join('\n')
            },
        ],
        timestamp: Date.now()
    })
};

export default new Command({
    nameLocalizations: {
        fr: 'monnaies'
    },
    description: "💰 Displays the currencies the user owns",
    descriptionLocalizations: {
        fr: "💰 Affiche les monnaies que possède l'utilisateur"
    },
    messageCommand: {
        style: 'flat',
        aliases: [
            'wallet',
            'balance',
            'bal',
            'bank'
        ]
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'member',
                description: 'member',
                name_localizations: {
                    fr: 'membre'
                },
                description_localizations: {
                    fr: 'membre'
                }
            }
        ]
    },
    async onInteraction(interaction) {
        const member = interaction.options.getMember('member') ?? interaction.member;

        return await interaction.reply({
            allowedMentions: {},
            embeds: [await buildEmbed(member)],
        });
    },
    async onMessage(message, { args: [userId] }) {
        const member = userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member;

        return await message.reply({
            allowedMentions: {},
            embeds: [await buildEmbed(member as GuildMember)],
        });
    }
});
