import cron from 'node-cron'

import client from '../instance'

import { guildLevelRewardService, guildSettingsService, userService } from '@/database/services'
import { memberService } from '@/database/services/member'
import { guildMemberHelper } from '@/helpers'

import logger from '@/utils/logger'
import { levelUpCard } from '@/ui/assets/cards/levelUpCard'

import { levelToXp, xpToLevel } from '@/utils/math'
import { getDominantColor } from '@/utils/image'
import { dateElapsedRatio } from '@/utils'
import { GuildMember } from 'discord.js'

logger.log(`🔗 » VoiceSessions Job started`);

const MAX_TAG_BOOST = 0.1;

cron.schedule('* * * * *', async () => {
    for (const [userId, session] of client.voiceSessions.entries()) {
        const guilds = client.guilds.cache.filter(g => g.members.cache.has(userId));

        for (const guild of guilds.values()) {
            const { eco, progression } = await guildSettingsService.findManyOrCreate(guild.id, ['eco', 'progression']);

            const now = Date.now();
            const elapsed = now - session.timestamp;
            const minutesElapsed = Math.floor(elapsed / 60000);

            if (minutesElapsed < 1) continue;
            
            const guildId = guild.id;

            const user = await userService.findById(userId);
            const member = await memberService.findOrCreate({ userId, guildId });

            const ratio = user?.tagAssignedAt
                ? dateElapsedRatio(new Date(user.tagAssignedAt), 14)
                : 0;

            const tagBoostValue = ratio ? 1 + (ratio * MAX_TAG_BOOST) : 1;

            //-- Coins --//
            if (eco?.isActive && eco.isCoinsVoiceEnabled) {
                if ((minutesElapsed % eco.voiceGainInterval) === 0) {
                    const maxGain = eco.voiceMaxGain;
                    const minGain = eco.voiceMinGain;
                    const randomCoins = Math.floor((Math.floor(Math.random() * (maxGain - minGain + 1)) + minGain) * tagBoostValue);
                    
                    await memberService.addGuildCoins({
                        userId,
                        guildId,
                        amount: randomCoins,
                    });
                }
            }

            // --- XP & Leveling ---
            if (progression?.isActive && progression.isXpVoiceEnabled) {
                if ((minutesElapsed % progression.voiceGainInterval) === 0) {
                    const guildMember = await guild.members.fetch(userId).catch(() => null);
                    if (!(guildMember instanceof GuildMember)) continue;

                    let reachLevelMax = progression.maxLevel && member.level >= progression.maxLevel;

                    if (!reachLevelMax) {
                        const maxGain = progression.voiceMaxGain;
                        const minGain = progression.voiceMinGain;
                        const randomXP = Math.floor((Math.floor(Math.random() * (maxGain - minGain + 1)) + minGain) * tagBoostValue);

                        const currentLevel = xpToLevel(member.activityXp);
                        const newXP = member.activityXp + randomXP;
                        const newLevel = xpToLevel(newXP);

                        reachLevelMax = progression.maxLevel && newLevel >= progression.maxLevel;

                        if (reachLevelMax) {
                            await memberService.setActivityXp({
                                userId,
                                guildId,
                                value: levelToXp(progression.maxLevel)
                            });
                        } else {
                            await memberService.addActivityXp({
                                userId,
                                guildId,
                                amount: randomXP
                            });
                        }

                        // Level up notification
                        if (newLevel > currentLevel) {
                            let rewards = await guildLevelRewardService.findMany(guild.id);
                            rewards = rewards.filter(r => r.atLevel <= newLevel);

                            const rolesReward = await Promise.all(
                                rewards
                                    .filter(r => r.roleId && !guildMember.roles.cache.has(r.roleId))
                                    .map(r => guild.roles.fetch(r.roleId!))
                            );

                            if (rolesReward) await guildMember.roles.add(rolesReward as any);

                            const channel = guild.channels.cache.get(session.channelId);
                            if (channel?.isSendable()) {
                                const memberHelper = await guildMemberHelper(guildMember);
                                const displayLevel = reachLevelMax ? 'MAX' : newLevel;

                                await channel.send({
                                    content: `<@${userId}> Nv. **${currentLevel}** ➔ Nv. **${displayLevel}** 🎉`,
                                    files: [{
                                        attachment: await levelUpCard({
                                            username: memberHelper.getName() ?? 'unknown',
                                            avatarURL: memberHelper.getAvatarURL(),
                                            accentColor: guildMember.roles.color?.hexColor ?? await getDominantColor(memberHelper.getAvatarURL(), {
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

            await memberService.incrementVoiceTime({ userId, guildId });
        }
    }
});
