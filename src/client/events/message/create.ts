import { Event, MessageCommandStyle } from '@/structures'

import {
    guildIgnoredChannelService,
    guildLevelRewardService,
    guildSettingsService,
    memberService
} from '@/database/services'

import { levelUpCard } from '@/ui/assets/cards/levelUpCard'

import { getDominantColor } from '@/utils/image'
import { levelToXp, xpToLevel } from '@/utils/math'

import { guildMemberHelper } from '@/helpers'
import { dateElapsedRatio } from '@/utils'

const channelsAutomaticThread = [
    '1351619802002886706',
    '1405139939988996207'
]

const MAX_TAG_BOOST = 0.1;

export default new Event({
    name: 'messageCreate',
    async run({ events: [message] }) {
        if (message.author.bot || !message.guild) return;

        const prefix = process.env.PREFIX;

        if (message.content.startsWith(prefix)) {
            let args = message.content
                .slice(prefix.length)
                .trim()
                .split(/\s+/);

            const command = this.client.commands.resolveMessageCommand(args);
            if (
                !command
                || (
                    command.access?.guild?.authorizedIds
                    && !command.access.guild.authorizedIds.includes(message.guild.id)
                )
            ) return;

            if (command.messageCommand.style === MessageCommandStyle.SLASH_COMMAND) {
                args = args.slice(command.structure.message!.parts!.length + 1);
            } else {
                args = args.slice(1);
            }

            return this.client.emit('commandCreate', command, message, args);
        }

        if (this.client.mainGuild.id !== message.guild.id) return;

        const userId = message.author.id;
        const guildId = message.guild!.id;

        if (process.env.ENV === 'PROD' && channelsAutomaticThread.includes(message.channel.id)) {
            return await message.startThread({
                name: `Discussion avec ${message.author.username}`,
            });
        }

        const member = await memberService.updateOrCreate(userId, guildId, {
            update: {
                messageCount: {
                    increment: 1
                }
            },
            create: {
                messageCount: 1
            },
            include: {
                user: true
            }
        });

        const ratio = member.user?.tagAssignedAt
            ? dateElapsedRatio(new Date(member.user.tagAssignedAt), 14)
            : 0;

        const tagBoostValue = ratio ? 1 + (ratio * MAX_TAG_BOOST) : 1;

        const {
            progression: progressionSettings,
            eco: ecoSettings,
        } = await guildSettingsService.findManyOrCreate(guildId, ['progression', 'eco'])
        if (!progressionSettings || !ecoSettings) return;

        const isIgnoredProgressionChannel = await guildIgnoredChannelService.has(guildId, 'progression', message.channel.id);
        const isIgnoredEcoPChannel = await guildIgnoredChannelService.has(guildId, 'progression', message.channel.id);

        if (!isIgnoredEcoPChannel) {
            if (ecoSettings.isActive) {
                if (ecoSettings.isCoinsMessageEnabled) {
                    if (Math.random() < (ecoSettings.messageLuck / 100)) {
                        const maxGain = ecoSettings.messageMaxGain;
                        const minGain = ecoSettings.messageMinGain;

                        const randomCoins = Math.floor((Math.floor(Math.random() * (maxGain - minGain + 1)) + minGain) * tagBoostValue);

                        await memberService.updateOrCreate(userId, guildId, {
                            create: {
                                coins: randomCoins
                            },
                            update: {
                                coins: {
                                    increment: randomCoins
                                }
                            }
                        })
                    }
                }
            }
        }

        if (!isIgnoredProgressionChannel) {
            if (progressionSettings.isActive) {
                if (progressionSettings.isXpMessageEnabled) {
                    let reachLevelMax = progressionSettings.maxLevel && member.level >= progressionSettings.maxLevel

                    if (!reachLevelMax && (Math.random() < (progressionSettings.messageLuck / 100))) {
                        const maxGain = progressionSettings.messageMaxGain;
                        const minGain = progressionSettings.messageMinGain;

                        const randomXP = Math.floor((Math.floor(Math.random() * (maxGain - minGain + 1)) + minGain) * tagBoostValue);

                        const currentLevel = xpToLevel(member.xp);
                        const newXP = member.xp + randomXP;
                        const newLevel = xpToLevel(newXP);

                        reachLevelMax = progressionSettings.maxLevel && newLevel >= progressionSettings.maxLevel;

                        if (reachLevelMax) {
                            const amount = levelToXp(progressionSettings.maxLevel);

                            await memberService.setXp(userId, guildId, amount);
                        } else {
                            await memberService.addXp(userId, guildId, randomXP);
                        }

                        if (newLevel > currentLevel) {
                            let rewards = await guildLevelRewardService.findMany(guildId);
                            if (rewards.length) {
                                rewards = rewards.filter(({ atLevel }) => {
                                    return atLevel <= newLevel
                                });

                                const rolesReward = await Promise.all(
                                    rewards
                                        .filter(({ roleId }) => roleId && !message.member?.roles.cache.get(roleId))
                                        .map(async ({ roleId }) => {
                                            return await message.guild!.roles.fetch(roleId!)
                                        })
                                );

                                if (rolesReward) {
                                    await message.member?.roles.add(rolesReward as any);
                                }
                            };


                            const memberHelper = await guildMemberHelper(message.member!);
                            const displayLevel = reachLevelMax ? 'MAX' : newLevel;

                            await message.channel.send({
                                content: `<@${userId}> Nv. **${currentLevel}** ➔ Nv. **${displayLevel}** 🎉`,
                                files: [{
                                    attachment: await levelUpCard({
                                        username: memberHelper.getName() ?? 'unknown',
                                        avatarURL: memberHelper.getAvatarURL(),
                                        accentColor: message.member!.roles.color?.hexColor ?? await getDominantColor(memberHelper.getAvatarURL(), false),
                                        newLevel: displayLevel,
                                    }),
                                    name: 'levelUpCard.png'
                                }]
                            });
                        }
                    }
                }
            }

        }
    }
});