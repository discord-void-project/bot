/*
  Warnings:

  - You are about to drop the column `bank` on the `member` table. All the data in the column will be lost.
  - You are about to drop the `guild_ignored_channel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `guild_level_rewards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `guild_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `guild_ignored_channel` DROP FOREIGN KEY `guild_ignored_channel_guildId_fkey`;

-- DropForeignKey
ALTER TABLE `guild_level_rewards` DROP FOREIGN KEY `guild_level_rewards_guildId_fkey`;

-- DropForeignKey
ALTER TABLE `guild_settings` DROP FOREIGN KEY `guild_settings_guildId_fkey`;

-- AlterTable
ALTER TABLE `member` DROP COLUMN `bank`;

-- DropTable
DROP TABLE `guild_ignored_channel`;

-- DropTable
DROP TABLE `guild_level_rewards`;

-- DropTable
DROP TABLE `guild_settings`;

-- CreateTable
CREATE TABLE `GuildIgnoredChannel` (
    `guildId` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `type` ENUM('progression', 'economy') NOT NULL,

    PRIMARY KEY (`guildId`, `channelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuildLevelReward` (
    `guildId` VARCHAR(191) NOT NULL,
    `atLevel` INTEGER NOT NULL,
    `roleId` VARCHAR(191) NULL,
    `xpReward` INTEGER NULL,
    `coinsReward` INTEGER NULL,

    UNIQUE INDEX `GuildLevelReward_roleId_atLevel_key`(`roleId`, `atLevel`),
    PRIMARY KEY (`guildId`, `atLevel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuildSettings` (
    `guildId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `options` JSON NOT NULL,

    PRIMARY KEY (`guildId`, `name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MemberBank` (
    `userId` VARCHAR(191) NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,
    `tier` ENUM('TIER_0', 'TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5', 'TIER_6', 'TIER_7', 'TIER_8') NOT NULL DEFAULT 'TIER_0',
    `funds` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`userId`, `guildId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GuildIgnoredChannel` ADD CONSTRAINT `GuildIgnoredChannel_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuildLevelReward` ADD CONSTRAINT `GuildLevelReward_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuildSettings` ADD CONSTRAINT `GuildSettings_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemberBank` ADD CONSTRAINT `MemberBank_userId_guildId_fkey` FOREIGN KEY (`userId`, `guildId`) REFERENCES `Member`(`userId`, `guildId`) ON DELETE CASCADE ON UPDATE CASCADE;
