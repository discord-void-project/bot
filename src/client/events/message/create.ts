import { Event, MessageCommandStyle } from '@/structures'

import { memberService } from '@/database/services/member'

/** @deprecated */
const channelsAutomaticThread = [
    '1351619802002886706',
    '1405139939988996207'
]

export default new Event({
    name: 'messageCreate',
    async run({ events: [message] }) {
        if (message.author.bot || !message.guild) return;

        const prefix = process.env.PREFIX;

        const messageStartsWithPrefix = message.content.startsWith(prefix)

        if (messageStartsWithPrefix) {
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

        if (this.client.mainGuild.id === message.guild.id) {
            if (process.env.ENV === 'PROD' && channelsAutomaticThread.includes(message.channel.id)) {
                return await message.startThread({
                    name: `Discussion avec ${message.author.username}`,
                });
            }
        };

        const userId = message.author.id;
        const guildId = message.guild.id;

        if (!messageStartsWithPrefix) {
            await memberService.incrementMessageCount({ userId, guildId });
        }


        // const [
        //     user,
        //     member,
        //     guildLevelModule,
        //     ecoLevelModule
        // ] = await Promise.all([
        //     userService.findById(userId),
        //     memberService.incrementMessageCount({ userId, guildId }),
        //     guildModuleService.findById({ guildId, moduleName: 'level' }),
        //     guildModuleService.findById({ guildId, moduleName: 'eco' }),
        // ]);

        // const tagBoostRatio = user?.tagAssignedAt ? dateElapsedRatio(new Date(user.tagAssignedAt), 14) : 0;

        // const tagBoostValue = ratio ? 1 + (ratio * MAX_TAG_BOOST) : 1;

        // if (!guildLevelModule || !ecoLevelModule) return;

        // const isIgnoredProgressionChannel = await guildIgnoredChannelService.has(guildId, 'progression', message.channel.id);
        // const isIgnoredEcoPChannel = await guildIgnoredChannelService.has(guildId, 'progression', message.channel.id);

        // if (!isIgnoredEcoPChannel) {
        //     if (ecoSettings.isActive) {
        //         if (ecoSettings.isCoinsMessageEnabled) {
        //             if (Math.random() < (ecoSettings.messageLuck / 100)) {
        //                 const maxGain = ecoSettings.messageMaxGain;
        //                 const minGain = ecoSettings.messageMinGain;

        //                 const randomCoins = Math.floor((Math.floor(Math.random() * (maxGain - minGain + 1)) + minGain) * tagBoostValue);

        //                 await memberService.addGuildCoins({
        //                     userId,
        //                     guildId,
        //                     amount: randomCoins
        //                 });
        //             }
        //         }
        //     }
        // }

        // if (!isIgnoredProgressionChannel) {
        //     if (progressionSettings.isActive) {
        //         if (progressionSettings.isXpMessageEnabled) {
        //             let reachLevelMax = progressionSettings.maxLevel && member.level >= progressionSettings.maxLevel

        //             if (!reachLevelMax && (Math.random() < (progressionSettings.messageLuck / 100))) {
        //                 const maxGain = progressionSettings.messageMaxGain;
        //                 const minGain = progressionSettings.messageMinGain;

        //                 const randomXP = Math.floor((Math.floor(Math.random() * (maxGain - minGain + 1)) + minGain) * tagBoostValue);

        //                 const currentLevel = xpToLevel(member.activityXp);
        //                 const newXP = member.activityXp + randomXP;
        //                 const newLevel = xpToLevel(newXP);

        //                 reachLevelMax = progressionSettings.maxLevel && newLevel >= progressionSettings.maxLevel;

        //                 if (reachLevelMax) {
        //                     const amount = levelToXp(progressionSettings.maxLevel);

        //                     await memberService.setActivityXp({
        //                         userId,
        //                         guildId,
        //                         value: amount
        //                     });
        //                 } else {
        //                     await memberService.addActivityXp({
        //                         userId,
        //                         guildId,
        //                         amount: randomXP
        //                     });
        //                 }

        //                 if (newLevel > currentLevel) {
        //                     let rewards = await guildLevelRewardService.findMany(guildId);
        //                     if (rewards.length) {
        //                         rewards = rewards.filter(({ atLevel }) => {
        //                             return atLevel <= newLevel
        //                         });

        //                         const rolesReward = await Promise.all(
        //                             rewards
        //                                 .filter(({ roleId }) => roleId && !message.member?.roles.cache.get(roleId))
        //                                 .map(async ({ roleId }) => {
        //                                     return await message.guild!.roles.fetch(roleId!)
        //                                 })
        //                         );

        //                         if (rolesReward) {
        //                             await message.member?.roles.add(rolesReward as any);
        //                         }
        //                     };


        //                     const memberHelper = await guildMemberHelper(message.member!);
        //                     const displayLevel = reachLevelMax ? 'MAX' : newLevel;

        //                     await message.channel.send({
        //                         content: `<@${userId}> Nv. **${currentLevel}** ➔ Nv. **${displayLevel}** 🎉`,
        //                         files: [{
        //                             attachment: await levelUpCard({
        //                                 username: memberHelper.getName() ?? 'unknown',
        //                                 avatarURL: memberHelper.getAvatarURL(),
        //                                 accentColor: message.member!.roles.color?.hexColor ?? await getDominantColor(memberHelper.getAvatarURL(),  {
        //                                     returnRGB: false
        //                                 }),
        //                                 newLevel: displayLevel,
        //                             }),
        //                             name: 'levelUpCard.png'
        //                         }]
        //                     });
        //                 }
        //             }
        //         }
        //     }

        // }
    }
});