import { Event, MessageCommandStyle } from '@/structures'

import {
    userService,
    memberService,
    guildModuleService,
    channelBlacklistService,
} from '@/database/services'

import {
    getDominantColor,
    levelToXp,
    randomNumber,
    timeElapsedFactor,
    xpToLevel
} from '@/utils'

import { levelUpCard } from '@/ui/assets/cards/levelUpCard'
import { applicationEmojiHelper, guildMemberHelperSync } from '@/helpers'
import { handleMemberRoleRewardSync } from '@/client/handlers/member-role-reward-sync'

/** @deprecated */
const channelsAutomaticThread = [
    '1351619802002886706',
    '1405139939988996207'
]

const factor = (condition: any, value = 0) => condition ? value : 0;

const isAtMaxLevel = (maxLevel: number, currentLevel: number) => {
    return maxLevel && currentLevel ? currentLevel >= maxLevel : false
}

export default new Event({
    name: 'messageCreate',
    async run({ events: [message] }) {
        if (message.author.bot || !message.guild) return;

        const userId = message.author.id;
        const guild = message.guild
        const guildId = guild.id;
        const channelId = message.channel.id;

        const channelScopeBlacklist = await channelBlacklistService.findMany({ guildId, channelId });

        const now = Date.now();

        let userSpamData = this.client.spamBuffer.get(userId);

        if (userSpamData && userSpamData.guildId === guildId) {
            const elapsed = now - userSpamData.lastMessageAt;

            if (elapsed < 750) {
                userSpamData.messageCount++;
            } else {
                userSpamData.messageCount = 0;
            }

            userSpamData.lastMessageAt = now;
            this.client.spamBuffer.set(userId, userSpamData);
        } else {
            userSpamData = {
                guildId,
                lastMessageAt: now,
                messageCount: 0,
            }

            this.client.spamBuffer.set(userId, userSpamData);
        }

        const prefix = process.env.PREFIX;

        const messageStartsWithPrefix = message.content.startsWith(prefix)

        if (messageStartsWithPrefix && !channelScopeBlacklist.COMMAND) {
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

        if (this.client.mainGuild.id === guildId) {
            if (process.env.ENV === 'PROD' && channelsAutomaticThread.includes(message.channel.id)) {
                return await message.startThread({
                    name: `Discussion avec ${message.author.username}`,
                });
            }
        };

        if (!messageStartsWithPrefix) {
            await memberService.incrementMessageCount({ userId, guildId });
        }

        const [
            userDatabase,
            memberDatabase,
            guildEcoModule,
            guildLevelModule
        ] = await Promise.all([
            userService.findById(userId),
            memberService.findById({ guildId, userId }),
            guildModuleService.findById({ guildId, moduleName: 'eco' }),
            guildModuleService.findById({ guildId, moduleName: 'level' }),
        ]);

        const guildBoostElapsedProgress = timeElapsedFactor(message?.member?.premiumSince, 7);
        const tagBoostElapsedProgress = timeElapsedFactor(userDatabase?.tagAssignedAt, 14);

        if (guildEcoModule?.isActive && !channelScopeBlacklist.ECONOMY) {
            const { settings } = guildEcoModule;

            if (settings?.guildPointsFromMessageEnabled) {
                if (Math.random() < settings.messageChance) {
                    const maxGain = settings.messageMaxGain;
                    const minGain = settings.messageMinGain;

                    // Penalty
                    const spamFactor = factor(userSpamData.messageCount, userSpamData.messageCount / 5);

                    // Bonus
                    const guildBoostFactor = factor(settings.boosterFactor, guildBoostElapsedProgress * settings.boosterFactor);
                    const tagBoostFactor = factor(settings.tagSupporterFactor, tagBoostElapsedProgress * settings.tagSupporterFactor);

                    const bonusFactor = tagBoostFactor + guildBoostFactor;

                    const randomCoins = Math.floor(randomNumber(minGain, maxGain) * (1 + (bonusFactor)) * (1 - spamFactor));

                    if (randomCoins > 0) {
                        await memberService.addGuildCoins({
                            userId,
                            guildId,
                        }, randomCoins);
                    }
                }
            }
        }

        if (guildLevelModule?.isActive && !channelScopeBlacklist.LEVEL) {
            const { settings } = guildLevelModule;

            if (settings?.isXpFromMessageEnabled) {
                const currentLevel = memberDatabase?.activityLevel ?? 1;
                let reachLevelMax = isAtMaxLevel(settings.maxLevel, currentLevel);

                if (!reachLevelMax && (Math.random() < settings.messageChance)) {
                    const maxGain = 125;
                    const minGain = 75;

                    // Penalty
                    const spamFactor = factor(userSpamData.messageCount, userSpamData.messageCount / 5);

                    // Bonus
                    const guildBoostFactor = factor(settings.boosterFactor, guildBoostElapsedProgress * settings.boosterFactor);
                    const tagBoostFactor = factor(settings.tagSupporterFactor, tagBoostElapsedProgress * settings.tagSupporterFactor);

                    const bonusFactor = tagBoostFactor + guildBoostFactor;

                    const randomXP = Math.floor(randomNumber(minGain, maxGain) * (1 + (bonusFactor)) * (1 - spamFactor));

                    if (randomXP > 0) {
                        const currentXP = memberDatabase?.activityXp ?? 0;
                        const newLevel = xpToLevel(currentXP + randomXP);

                        reachLevelMax = isAtMaxLevel(settings.maxLevel, newLevel);

                        if (reachLevelMax) {
                            const xpMaxLevel = levelToXp(settings.maxLevel);

                            await memberService.setActivityXp({
                                userId,
                                guildId,
                            }, xpMaxLevel);
                        } else {
                            await memberService.addActivityXp({
                                userId,
                                guildId,
                            }, randomXP);
                        }

                        if (currentLevel < newLevel) {
                            const { greenArrowEmoji } = applicationEmojiHelper();

                            const rewards = await handleMemberRoleRewardSync({
                                guild,
                                member: message.member!,
                                activityLevel: newLevel
                            });

                            const memberHelper = guildMemberHelperSync(message.member!);
                            const displayLevel = reachLevelMax ? 'MAX' : newLevel;

                            const messageLines = [
                                `Nv. **${currentLevel}** ➔ Nv. **${displayLevel}** 🎉`,
                            ];

                            if (rewards.roleIds.length === 1) {
                                messageLines.push(`> 🏅 Nouveau rôle débloqué ${greenArrowEmoji} <@&${rewards.roleIds[0]}>`);
                            } else if (rewards.roleIds.length > 1) {
                                messageLines.push(`> 🏅 Nouveaux rôles débloqué :`);
                                for (const roleId of rewards.roleIds) {
                                    messageLines.push(`> - <@&${roleId}>`);
                                }
                            }

                            if (guildEcoModule?.isActive && rewards?.totalGuildPoints) {
                                await memberService.addGuildCoins({
                                    guildId,
                                    userId
                                }, rewards.totalGuildPoints);

                                messageLines.push(`> 💰 Gain de pièce de serveur ${greenArrowEmoji} **${rewards.totalGuildPoints.toLocaleString('en')}**`);
                            }

                            await message.reply({
                                content: messageLines.join('\n'),
                                allowedMentions: {
                                    roles: [],
                                    users: [message.member!.id],
                                    repliedUser: true
                                },
                                files: [{
                                    attachment: await levelUpCard({
                                        username: memberHelper.getName({ safe: true }),
                                        avatarURL: memberHelper.getAvatarURL(),
                                        accentColor: message.member?.roles.color?.hexColor ?? await getDominantColor(memberHelper.getAvatarURL(), {
                                            returnRGB: false
                                        }),
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