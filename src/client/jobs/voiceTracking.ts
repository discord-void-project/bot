import cron from 'node-cron'

import client from '../instance'

import { guildLevelRewardService, guildSettingsService, memberService } from '@/database/services'
import { guildMemberHelper } from '@/helpers'

import logger from '@/utils/logger'
import { levelUpCard } from '@/ui/assets/cards/levelUpCard'

import { levelToXp, xpToLevel } from '@/utils/math'
import { getDominantColor } from '@/utils/image'

logger.log(`🔗 » VoiceSessions Job started`);

cron.schedule('* * * * *', async () => {
    for (const [userId, session] of client.voiceSessions.entries()) {
        const guilds = client.guilds.cache.filter(g => g.members.cache.has(userId));

        for (const guild of guilds.values()) {
            const { eco, progression } = await guildSettingsService.findManyOrCreate(guild.id, ['eco', 'progression']);

            const now = Date.now();
            const elapsed = now - session.timestamp;
            const minutesElapsed = Math.floor(elapsed / 60000);

            if (minutesElapsed < 1) continue; // pas encore 1 minute

            // --- Coins ---
            if (eco?.isActive && eco.isCoinsVoiceEnabled) {
                if ((minutesElapsed % eco.voiceGainInterval) === 0) {
                    const maxGain = eco.voiceMaxGain;
                    const minGain = eco.voiceMinGain;
                    const randomCoins = Math.floor(Math.random() * (maxGain - minGain + 1)) + minGain;

                    await memberService.updateOrCreate(userId, guild.id, {
                        create: { coins: randomCoins },
                        update: { coins: { increment: randomCoins } }
                    });
                }
            }

            // --- XP & Leveling ---
            if (progression?.isActive && progression.isXpVoiceEnabled) {
                if ((minutesElapsed % progression.voiceGainInterval) === 0) {
                    const guildMember = await guild.members.fetch(userId).catch(() => null);
                    if (!guildMember) continue;

                    const { member: memberRecord } = await memberService.findOrCreate(userId, guild.id);

                    let reachLevelMax = progression.maxLevel && memberRecord.level >= progression.maxLevel;

                    if (!reachLevelMax) {
                        const maxGain = progression.voiceMaxGain;
                        const minGain = progression.voiceMinGain;
                        const randomXP = Math.floor(Math.random() * (maxGain - minGain + 1)) + minGain;

                        const currentLevel = xpToLevel(memberRecord.xp);
                        const newXP = memberRecord.xp + randomXP;
                        const newLevel = xpToLevel(newXP);

                        reachLevelMax = progression.maxLevel && newLevel >= progression.maxLevel;

                        if (reachLevelMax) {
                            const amount = levelToXp(progression.maxLevel);
                            await memberService.updateOrCreate(userId, guild.id, {
                                create: { xp: amount },
                                update: { xp: { set: amount } }
                            });
                        } else {
                            await memberService.updateOrCreate(userId, guild.id, {
                                create: { xp: randomXP },
                                update: { xp: { increment: randomXP } }
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
                                            accentColor: guildMember.roles.color?.hexColor ?? await getDominantColor(memberHelper.getAvatarURL(), false),
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

            client.voiceSessions.set(userId, { ...session, timestamp: now });
        }
    }
});
