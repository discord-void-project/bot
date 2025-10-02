import { Command } from '@/structures/Command'
import { ChannelType, ComponentType, GuildPremiumTier, MessageFlags } from 'discord.js'

import { configColors, mainGuildConfig } from '@/client/config'

import useEmojis from '@/ui/useEmojis'
import container from '@/ui/container'
import { section, textDisplay, thumbnail } from '@/ui/components'

import { escapeAllMarkdown, getDominantColor } from '@/utils'

export default new Command({
    description: "📋 Retrieves a guild's information",
    descriptionLocalizations: {
        fr: "📋 Récupère les informations du serveur"
    },
    access: {
        guild: {
            authorizedIds: [
                mainGuildConfig.id
            ]
        }
    },
    async onInteraction(interaction) {
        const {
            stageChannelEmoji,
            textChannelEmoji,
            voiceChannelEmoji,
            categoryChannelEmoji,
            onlineEmoji,
            dndEmoji,
            idleEmoji,
            whiteArrowEmoji
        } = useEmojis();

        const guild = interaction.guild!;

        const [guildOwner, allMembers, channels] = await Promise.all([
            guild.fetchOwner(),
            guild.members.fetch(),
            guild.channels.fetch()
        ]);

        const memberCounts = {
            total: allMembers.size,
            members: allMembers.filter(m => !m.user.bot).size,
            bots: allMembers.filter(m => m.user.bot).size,
            online: allMembers.filter(m => m.presence?.status === 'online').size,
            dnd: allMembers.filter(m => m.presence?.status === 'dnd').size,
            idle: allMembers.filter(m => m.presence?.status === 'idle').size
        };

        const channelCounts = {
            total: channels.size,
            text: channels.filter((c: any) => c.type === ChannelType.GuildText).size,
            voice: channels.filter((c: any) => c.type === ChannelType.GuildVoice).size,
            stage: channels.filter((c: any) => c.type === ChannelType.GuildStageVoice).size,
            category: channels.filter((c: any) => c.type === ChannelType.GuildCategory).size
        };

        const createdTimestamp = Math.floor(guild.createdTimestamp / 1000);
        const formatPremiumTier = (tier: GuildPremiumTier) => tier == 3 ? 'Nv. **MAX**' : tier == 0 ? `Aucun niveau` : `Nv. **${tier}**`;

        let components: any[] = [
            section({
                accessory: thumbnail(guild.iconURL()!),
                components: [
                    textDisplay(`## ${escapeAllMarkdown(guild.name)}`),
                    textDisplay([
                        guild.description && `> ${guild.description}`,
                        `**Identifiant**\n- **\`${guild.id}\`**`,
                        `**Propriétaire du serveur**\n- ${guildOwner} **\`(${guildOwner.user.username})\`**`,
                        `**Niveau de boost**\n- ${formatPremiumTier(guild.premiumTier)}`,
                        `**Nombre de boost**\n- ${guild.premiumSubscriptionCount}`,
                        `**Création du serveur**\n- <t:${createdTimestamp}>\n- <t:${createdTimestamp}:R>`,
                    ].filter(Boolean).join('\n')),
                ]
            }),
            textDisplay([
                '**Salons**',
                `🏷️ ${whiteArrowEmoji} **${channelCounts.total}** salons totaux`,
                `${textChannelEmoji} ${whiteArrowEmoji} **${channelCounts.text}** salons textuels`,
                `${voiceChannelEmoji} ${whiteArrowEmoji} **${channelCounts.voice}** salons vocaux`,
                `${stageChannelEmoji} ${whiteArrowEmoji} **${channelCounts.stage}** salons de conférences`,
                `${categoryChannelEmoji} ${whiteArrowEmoji} **${channelCounts.category}** catégories`,
            ].join('\n')),
            textDisplay([
                '**Membres**',
                `😀 ${whiteArrowEmoji} **${memberCounts.total}** membres totaux`,
                `👤 ${whiteArrowEmoji} **${memberCounts.members}** membres`,
                `🤖 ${whiteArrowEmoji} **${memberCounts.bots}** bots`,
                `${onlineEmoji} ${whiteArrowEmoji} **${memberCounts.online}** en ligne`,
                `${dndEmoji} ${whiteArrowEmoji} **${memberCounts.dnd}** en ne pas déranger`,
                `${idleEmoji} ${whiteArrowEmoji} **${memberCounts.idle}** en inactivité`
            ].join('\n'))
        ]

        if (guild.banner) {
            components.unshift({
                type: ComponentType.MediaGallery,
                items: [
                    {
                        media: {
                            url: guild.bannerURL({ size: 1024 })
                        }
                    }
                ]
            })
        }

        return await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {
                repliedUser: false
            },
            components: [
                container.custom({
                    accent_color: await getDominantColor(guild.iconURL({ forceStatic: true })!) as number ?? configColors.PURPLE,
                    components
                })
            ]
        });
    }
})