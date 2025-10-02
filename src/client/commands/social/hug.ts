import { Command } from '@/structures'
import { ApplicationCommandOptionType } from 'discord.js'

import { mainGuildConfig } from '@/client/config'
import { waifuAPI } from '@/api'
import { EmbedUI } from '@/ui/EmbedUI'

export default new Command({
    description: '🤗 hug someone',
    nameLocalizations: {
        fr: 'câlin',
    },
    descriptionLocalizations: {
        fr: "🤗 serrer quelqu'un dans ses bras"
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

        const sentence = `${interaction.user} viens de faire un câlin à ${target} 🤗`;

        return await interaction.reply({
            content: hasUser ? sentence : undefined,
            embeds: [
                EmbedUI.createMessage({
                    color: 'purple',
                    description: hasUser ? undefined : sentence,
                    image: {
                        url: await waifuAPI('hug')
                    }
                })
            ]
        })
    }
})