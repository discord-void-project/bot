-- CreateTable
CREATE TABLE `Blacklist` (
    `userId` VARCHAR(191) NOT NULL,
    `modId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED') NOT NULL DEFAULT 'PENDING',
    `reason` VARCHAR(191) NULL,
    `blacklistAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Guild` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlacklistGuild` (
    `userId` VARCHAR(191) NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,
    `accepted` BOOLEAN NULL,

    UNIQUE INDEX `BlacklistGuild_guildId_userId_key`(`guildId`, `userId`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guild_ignored_channel` (
    `guildId` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `type` ENUM('progression', 'economy') NOT NULL,

    PRIMARY KEY (`guildId`, `channelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guild_level_rewards` (
    `guildId` VARCHAR(191) NOT NULL,
    `atLevel` INTEGER NOT NULL,
    `roleId` VARCHAR(191) NULL,
    `xpReward` INTEGER NULL,
    `coinsReward` INTEGER NULL,

    UNIQUE INDEX `guild_level_rewards_roleId_atLevel_key`(`roleId`, `atLevel`),
    PRIMARY KEY (`guildId`, `atLevel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guild_settings` (
    `guildId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `options` JSON NOT NULL,

    PRIMARY KEY (`guildId`, `name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Member` (
    `userId` VARCHAR(191) NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,
    `xp` INTEGER NOT NULL DEFAULT 0,
    `messageCount` INTEGER NOT NULL DEFAULT 0,
    `voiceTotalMinutes` INTEGER NOT NULL DEFAULT 0,
    `coins` INTEGER NOT NULL DEFAULT 0,
    `bank` INTEGER NOT NULL DEFAULT 0,
    `dailyStreak` INTEGER NOT NULL DEFAULT 0,
    `lastDailyAt` DATETIME(3) NULL,
    `lastWorkAt` DATETIME(3) NULL,
    `lastRobAt` DATETIME(3) NULL,

    PRIMARY KEY (`userId`, `guildId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildId` VARCHAR(191) NOT NULL,
    `cost` INTEGER NOT NULL,
    `stock` INTEGER NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `flags` INTEGER NOT NULL DEFAULT 0,
    `tagAssignedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Warn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `modId` VARCHAR(191) NOT NULL,
    `warnAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reason` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Blacklist` ADD CONSTRAINT `Blacklist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Blacklist` ADD CONSTRAINT `Blacklist_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlacklistGuild` ADD CONSTRAINT `BlacklistGuild_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Blacklist`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlacklistGuild` ADD CONSTRAINT `BlacklistGuild_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guild_ignored_channel` ADD CONSTRAINT `guild_ignored_channel_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guild_level_rewards` ADD CONSTRAINT `guild_level_rewards_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guild_settings` ADD CONSTRAINT `guild_settings_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopItem` ADD CONSTRAINT `ShopItem_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Warn` ADD CONSTRAINT `Warn_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Warn` ADD CONSTRAINT `Warn_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Warn` ADD CONSTRAINT `Warn_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
