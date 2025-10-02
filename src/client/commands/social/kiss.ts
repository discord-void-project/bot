import { Command } from '@/structures'
import { ApplicationCommandOptionType } from 'discord.js'

import { mainGuildConfig } from '@/client/config'
import { waifuAPI } from '@/api'
import embed from '@/ui/embed'

export default new Command({
    description: '😘 kiss someone',
    nameLocalizations: {
        fr: 'bisous'
    },
    descriptionLocalizations: {
        fr: "😘 embrasser quelqu'un"
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'user',
                description: 'user to blacklist',
                name_localizations: {
                    fr: 'utilisateur'
                },
                description_localizations: {
                    fr: 'utilisateur à mettre sur liste noir'
                },
                required: true
            },
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
        const hasUser = interaction.options.getUser('user');
        const target = hasUser ?? interaction.guild?.members.cache.filter((member) => !member.user.bot).random();

        const sentence = `${interaction.user} viens de faire un bisous à ${target} 😘`;

        return await interaction.reply({
            content: hasUser ? sentence : undefined,
            embeds: [
                embed.purple({
                    description: hasUser ? undefined : sentence,
                    image: {
                        url: await waifuAPI('kiss')
                    }
                })
            ]
        })
    }
})