import cron from 'node-cron'
import { jobsLogger } from './index'

import client from '../instance'
import { guildModuleService, memberService, userService } from '@/database/services'

import { levelUpCard } from '@/ui/assets/cards/levelUpCard'

import { applicationEmojiHelper, guildMemberHelperSync } from '@/helpers'
import { getDominantColor, levelToXp, randomNumber, timeElapsedFactor, xpToLevel } from '@/utils'
import { channelBlacklistService } from '@/database/services/channel-blacklist'
import { handleMemberRoleRewardSync } from '../handlers/member-role-reward-sync'

jobsLogger.borderBox('🔗 » Tick Job started');

const factor = (condition: any, value = 0) => condition ? value : 0;

const isAtMaxLevel = (maxLevel: number, currentLevel: number) => {
    return maxLevel && currentLevel ? currentLevel >= maxLevel : false
}

cron.schedule('* * * * *', async () => {
    try {
        for (const [userId, session] of client.callSessions.cache) {
            const guild = client.guilds.cache.find((guild) => guild.id === session.guildId);
            if (!guild) return;

            const now = Date.now();
            const elapsed = now - session.timestamp;
            const minutesElapsed = Math.floor(elapsed / (60 * 1000));

            if (minutesElapsed <= 0) continue;

            const guildId = guild.id;

            const [
                userDatabase,
                memberDatabase,
                guildEcoModule,
                guildLevelModule,
                channelScopeBlacklist
            ] = await Promise.all([
                userService.findById(userId),
                memberService.findById({ guildId, userId }),
                guildModuleService.findById({ guildId, moduleName: 'eco' }),
                guildModuleService.findById({ guildId, moduleName: 'level' }),
                channelBlacklistService.findMany({ guildId, channelId: session.channelId })
            ]);

            const member = guild.members.cache.get(userId);

            const guildBoostElapsedProgress = timeElapsedFactor(member?.premiumSince, 7);
            const tagBoostElapsedProgress = timeElapsedFactor(userDatabase?.tagAssignedAt, 14);

            if (guildEcoModule?.isActive && !channelScopeBlacklist.ECONOMY) {
                const { settings } = guildEcoModule

                if (settings?.guildPointsFromCallEnabled) {
                    if ((minutesElapsed % settings.callGainIntervalMinutes) === 0) {
                        const maxGain = settings.callMaxGain;
                        const minGain = settings.callMinGain;

                        // Penalty
                        const callPrivateFactor = factor(session.flags.isPrivate, settings.callPrivatePenalty);
                        const muteFactor = factor(session.flags.isMuted, settings.callMutedPenalty);
                        const deafFactor = factor(session.flags.isDeaf, settings.callDeafPenalty);

                        const penaltyFactor = deafFactor + muteFactor + callPrivateFactor;

                        // Bonus
                        const guildBoostFactor = factor(settings.boosterFactor, guildBoostElapsedProgress * settings.boosterFactor);
                        const tagBoostFactor = factor(settings.tagSupporterFactor, tagBoostElapsedProgress * settings.tagSupporterFactor);
                        const cameraBoostFactor = factor(session.flags.hasCamera, settings.callCameraBonus);
                        const streamBoostFactor = factor(session.flags.isStreaming, settings.callStreamBonus);

                        const bonusFactor = tagBoostFactor + guildBoostFactor + cameraBoostFactor + streamBoostFactor;

                        const randomCoins = Math.floor(randomNumber(minGain, maxGain) * (1 + (bonusFactor)) * (1 - (penaltyFactor)));

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

                    if (!reachLevelMax && (minutesElapsed % settings.callGainIntervalMinutes) === 0) {
                        const maxGain = 250;
                        const minGain = 150;

                        // Penalty
                        const callPrivateFactor = factor(session.flags.isPrivate, settings.callPrivatePenalty);
                        const muteFactor = factor(session.flags.isMuted, settings.callMutedPenalty);
                        const deafFactor = factor(session.flags.isDeaf, settings.callDeafPenalty);

                        const penaltyFactor = deafFactor + muteFactor + callPrivateFactor;

                        // Bonus
                        const guildBoostFactor = factor(settings.boosterFactor, guildBoostElapsedProgress * settings.boosterFactor);
                        const tagBoostFactor = factor(settings.tagSupporterFactor, tagBoostElapsedProgress * settings.tagSupporterFactor);
                        const cameraBoostFactor = factor(session.flags.hasCamera, settings.callCameraBonus);
                        const streamBoostFactor = factor(session.flags.isStreaming, settings.callStreamBonus);

                        const bonusFactor = tagBoostFactor + guildBoostFactor + cameraBoostFactor + streamBoostFactor;

                        const randomXP = Math.floor(randomNumber(minGain, maxGain) * (1 + (bonusFactor)) * (1 - (penaltyFactor)));

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

                            if ((currentLevel < newLevel) && member) {
                                const { greenArrowEmoji } = applicationEmojiHelper();

                                const rewards = await handleMemberRoleRewardSync({
                                    guild,
                                    member,
                                    activityLevel: newLevel
                                });

                                const memberHelper = guildMemberHelperSync(member);
                                const displayLevel = reachLevelMax ? 'MAX' : newLevel;

                                const messageLines = [
                                    `<@${userId}> Nv. **${currentLevel}** ➔ Nv. **${displayLevel}** 🎉`,
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

                                const channel = guild.channels.cache.get(session.channelId);
                                if (channel?.isSendable()) {
                                    await channel.send({
                                        content: messageLines.join('\n'),
                                        allowedMentions: {
                                            roles: [],
                                            users: [userId]
                                        },
                                        files: [{
                                            attachment: await levelUpCard({
                                                username: memberHelper.getName({ safe: true }),
                                                avatarURL: memberHelper.getAvatarURL(),
                                                accentColor: member?.roles.color?.hexColor ?? await getDominantColor(memberHelper.getAvatarURL(), {
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
        }

        // Clear Spam Cache
        if (client.spamBuffer.size > 0) {
            client.spamBuffer.clear();
        }
    } catch (ex) {
        return jobsLogger.error(ex);
    }
});
