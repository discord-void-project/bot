import {
    BaseMessageOptions,
    ChatInputCommandInteraction,
    Message,
    Team
} from 'discord.js'

import { Event } from '@/structures'

import prisma from '@/database/prisma'
import { UserFlags } from '@/database/utils/UserFlags'

import embed from '@/ui/embed'

const replyBy = async (interaction: Message | ChatInputCommandInteraction, payload: BaseMessageOptions) => {
    if (interaction instanceof ChatInputCommandInteraction) {
        return await interaction.reply(payload);
    } else if (interaction instanceof Message && interaction.channel.isSendable()) {
        return await interaction.reply(payload);
    }
}

export default new Event({
    name: 'commandCreate',
    async run({ events: [command, interaction, args] }) {
        const replyAuthorizationRefused = async (content: string[] | string, title?: string) => {
            if (!Array.isArray(content)) {
                content = [ content ];
            }

            return await replyBy(interaction, {
                embeds: [
                    embed.red({
                        title: `// ${title ?? "Authorization refusée"}`,
                        description: content.join('\n'),
                    })
                ]
            });
        }

        try {
            const access = command.access ?? null;
            const guild = interaction.guild;
            const user = interaction instanceof Message
                ? interaction.author
                : interaction.user;

            const memberPermissions = interaction instanceof Message
                ? interaction.member?.permissions
                : interaction.memberPermissions;

            if (!(guild && user)) {
                throw new Error('No guild or no user')
            };

            const userDatabase = await prisma.user.findUnique({
                where: {
                    id: user.id
                }
            });

            if (!this.client.application?.owner) {
                await this.client.application?.fetch();
            }

            const isDeveloper = (this.client.application!.owner as Team).members.has(user.id);

            if (access) {
        //         if (access.guild) {
        //             if (access.guild?.premium && !(await guildRepository.hasFeatures(guild.id, ['PREMIUM']))) {
        //                 return await replyError([
        //                     `${redBulletEmoji} Commande accessible uniquement aux communautés premium`
        //                 ]);
        //             }

        //             if (access.guild?.partner && !(await guildRepository.hasFeatures(guild.id, ['PARTNERED']))) {
        //                 return await replyError([
        //                     `${redBulletEmoji} Commande accessible uniquement aux communautés partenaire`
        //                 ]);
        //             }

        //             if (access.guild?.features && !(await guildRepository.hasFeatures(guild.id, access.guild.features))) {
        //                 return await replyError([
        //                     `${redBulletEmoji} Cette communauté doit posséder les fonctionnalités suivantes :`,
        //                     access.guild.features
        //                         .map((feature) => `${emptyEmoji}${graySubEntryEmoji} ${feature}`)
        //                         .join('\n')
        //                 ]);
        //             }

        //             if (access.guild.modules) {
        //                 const moduleNames = Object.keys(access.guild.modules) as GuildModuleName[];
        //                 const areModulesEnabled = await guildRepository.hasModulesEnabled(guild.id, moduleNames);
        //                 const areModuleFieldsEnabled = await Promise.all(
        //                     moduleNames.map(async (m) => {
        //                         const fields = access.guild?.modules?.[m];
        //                         if (!fields?.length) {
        //                             return true;
        //                         }

        //                         return await guildRepository.hasModuleConfigFieldsEnabled(guild.id, m, fields as any);
        //                     })
        //                 ).then((m) => m.every(Boolean));

        //                 console.log(areModuleFieldsEnabled);

        //                 if (!(areModulesEnabled && areModuleFieldsEnabled)) {
        //                     return await replyError([
        //                         `${redBulletEmoji} Un ou plusieurs modules requis sont désactivés par le gérant de cette communauté`
        //                     ]);
        //                 }
        //             }
        //         }

                if (access.channel) {
                    if (
                        access.channel?.isNSFW && interaction.channel?.isTextBased()
                        && 'nsfw' in interaction.channel
                        && !interaction.channel.nsfw
                    ) {
                        return await replyAuthorizationRefused(`Cette commande ne peut être utilisée que dans les salons NSFW`);
                    }
                }

                if (access.user) {
                    if (access.user?.isDeveloper && !isDeveloper) {
                        return await replyAuthorizationRefused(`Cette commande est accessible uniquement au développeur`);
                    }

                    if (userDatabase && !isDeveloper) {
                        if (access.user?.isStaff && !userDatabase.flags.has(UserFlags.STAFF)) {
                            return await replyAuthorizationRefused(`Cette commande est accessible uniquement aux personnes ayant une haute autorité`);
                        }

                        if (access.user?.isBetaTester && !userDatabase.flags.has(UserFlags.BETA)) {
                            return await replyAuthorizationRefused(`Cette commande est accessible uniquement aux bêta-testeurs`);
                        }
                    }

                    if (access.user?.isGuildOwner && user.id !== guild.ownerId) {
                        return await replyAuthorizationRefused(`Vous n’êtes pas le propriétaire de cette communauté`);
                    }

                    if (access.user?.requiredPermissions && !memberPermissions?.has(access.user.requiredPermissions)) {
                        return await replyAuthorizationRefused(`Vous n'avez pas les permissions nécessaire`);
                    }
                }
            }

            if (
                interaction instanceof ChatInputCommandInteraction
                && command.onInteraction
                && interaction.inCachedGuild()
            ) {
                return await command.onInteraction(interaction);
            } else if (
                interaction instanceof Message
                && command.onMessage
                && interaction.inGuild()
            ) {
                return await command.onMessage(interaction, { args });
            }
        } catch (err) {
            this.client.logger.error(err);

            return await replyBy(interaction, {
                files: ['https://i.pinimg.com/originals/89/9b/5a/899b5a60f74635cc686a794551e3238d.gif']
            });
        }
    }
});