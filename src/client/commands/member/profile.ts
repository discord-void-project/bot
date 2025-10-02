import { Command } from '@/structures'
import { ApplicationCommandOptionType, GuildMember, MessageFlags } from 'discord.js'

import { createMediaGallery, createSection, createSeparator, createTextDisplay, createThumbnail } from '@/ui/components/common'
import { ContainerUI } from '@/ui'

import { applicationEmojiHelper, guildMemberHelper } from '@/helpers'
import { getDominantColor, parseUserMention } from '@/utils'
import { userService } from '@/database/services'
import { UserFlags } from '@/database/utils'

const buildProfile = async (member: GuildMember) => {
    const { emptyEmoji, lightGrayBulletEmoji, graySubEntryEmoji, yellowRectEmoji } = applicationEmojiHelper();

    const helper = await guildMemberHelper(member, { fetchMember: true, fetchUser: true });

    const memberAvatar = helper.getAvatarURL({ forceStatic: true });
    const memberBanner = helper.getBannerURL({ size: 1024 });
    const memberBannerDominantColor = await getDominantColor(memberAvatar);
    const memberCreatedAt = Math.floor(member.user.createdTimestamp / 1000);
    const memberJoinedAt = member.joinedTimestamp
        ? Math.floor(member.joinedTimestamp / 1000)
        : null;
    const memberPremiumSinceAt = member.premiumSinceTimestamp
        ? Math.floor(member.premiumSinceTimestamp / 1000)
        : null;

    const hasGuildTag = member.user.primaryGuild?.identityGuildId === member.guild.id;

    const userDatabase = member.user.bot
        ? null
        : await userService.find(member.id);

    const userTagAssignedAt = userDatabase?.tagAssignedAt
        ? Math.floor(new Date(userDatabase.tagAssignedAt).getTime() / 1000)
        : null;

    const components: any[] = [];

    if (memberBanner) {
        components.push(
            createMediaGallery([{
                media: { url: memberBanner }
            }])
        );
    }

    components.push(
        createSection({
            accessory: createThumbnail({ url: memberAvatar }),
            components: [
                createTextDisplay(`## ${member}`),
                createTextDisplay([
                    `${lightGrayBulletEmoji} **Identifiant**`,
                    `${emptyEmoji}${graySubEntryEmoji} **\`${member.id}\`**`,
                    `${lightGrayBulletEmoji} **Nom d'utilisateur**`,
                    `${emptyEmoji}${graySubEntryEmoji} **\`${member.user.username}\`**`,
                    (userTagAssignedAt && hasGuildTag) && `${lightGrayBulletEmoji} **Porte le tag du serveur depuis**`,
                    (userTagAssignedAt && hasGuildTag) && `${emptyEmoji}${graySubEntryEmoji} <t:${userTagAssignedAt}>`,
                    (userTagAssignedAt && hasGuildTag) && `${emptyEmoji}${graySubEntryEmoji} <t:${userTagAssignedAt}:R>`,
                    memberPremiumSinceAt && `${lightGrayBulletEmoji} **Booster du serveur depuis**`,
                    memberPremiumSinceAt && `${emptyEmoji}${graySubEntryEmoji} <t:${memberPremiumSinceAt}>`,
                    memberPremiumSinceAt && `${emptyEmoji}${graySubEntryEmoji} <t:${memberPremiumSinceAt}:R>`,
                    `${lightGrayBulletEmoji} **Membre depuis**`,
                    `${emptyEmoji}${graySubEntryEmoji} <t:${memberJoinedAt}>`,
                    `${emptyEmoji}${graySubEntryEmoji} <t:${memberJoinedAt}:R>`,
                    `${lightGrayBulletEmoji} **Création du compte**`,
                    `${emptyEmoji}${graySubEntryEmoji} <t:${memberCreatedAt}>`,
                    `${emptyEmoji}${graySubEntryEmoji} <t:${memberCreatedAt}:R>`,
                ].filter(Boolean).join('\n'))
            ]
        })
    );

    if (member.user.bot || (userDatabase?.flags && userDatabase.flags.any([UserFlags.STAFF, UserFlags.BETA]))) {
        components.push(createSeparator());

        if (member.user.bot) {
            components.push(createTextDisplay('-# *Ce membre est un robot*'));
        } else if (userDatabase) {
            if (userDatabase.flags.has(UserFlags.STAFF)) {
                components.push(createTextDisplay('-# *Ce membre est un staff du bot*'));
            } else if (userDatabase.flags.has(UserFlags.BETA)) {
                components.push(createTextDisplay('-# *Ce membre est bêta-testeur du bot*'));
            }
        }
    }

    return ContainerUI.create({
        color: memberBannerDominantColor,
        components
    });
}

export default new Command({
    nameLocalizations: {
        fr: 'profil'
    },
    description: "😀 Retrieves a user's profile",
    descriptionLocalizations: {
        fr: "😀 Récupère le profil d'un utilisateur"
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
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {},
            components: [await buildProfile(member)],
        });
    },
    async onMessage(message, { args: [userId] }) {
        const member = userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member;

        return await message.reply({
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {},
            components: [await buildProfile(member as GuildMember)],
        });
    }
});
