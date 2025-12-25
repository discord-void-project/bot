export const defaultEcoGuildModuleSettings = {
    // Boost
    boosterFactor: 0.2,
    tagSupporterFactor: 0.1,

    // Message
    guildPointsFromMessageEnabled: true,
    messageChance: 0.3,
    messageMinGain: 8,
    messageMaxGain: 24,

    // Call
    guildPointsFromCallEnabled: true,
    callGainIntervalMinutes: 15,
    callPrivatePenalty: 0.25,
    callMutedPenalty: 0.25,
    callDeafPenalty: 0.35,
    callCameraBonus: 0.15,
    callStreamBonus: 0.15,
    callMinGain: 24,
    callMaxGain: 40,

    // Work
    isWorkEnabled: true,
    workCooldownMinutes: 60,
    workMinGain: 200,
    workMaxGain: 500,

    // Rob
    isRobEnabled: true,
    robSuccessChance: 0.3,
    robStealPercentage: 0.20,
    robCooldown: 60 * 60 * 1000,
    robbedCooldown: 3 * 60 * 60 * 1000,

    // Shop
    isShopEnabled: false,

    // Discount
    tagRolePriceDiscount: 0.15,
    tagUpgradeDiscount: 0.15,
}

export const defaultLevelGuildModuleSettings = {
    // Boost
    boosterFactor: 0.2,
    tagSupporterFactor: 0.1,

    // Message
    isXpFromMessageEnabled: true,
    messageChance: 0.2,

    // Call
    isXpFromCallEnabled: true,
    callPrivatePenalty: 0.25,
    callMutedPenalty: 0.25,
    callDeafPenalty: 0.35,
    callCameraBonus: 0.15,
    callStreamBonus: 0.15,
    callGainIntervalMinutes: 15,

    // Growth
    maxLevel: 100,
}

export const defaultGuildModuleSettings = {
    eco: defaultEcoGuildModuleSettings,
    level: defaultLevelGuildModuleSettings
};

export type GuildModuleName = keyof typeof defaultGuildModuleSettings;
export type GuildModuleSetting<T extends GuildModuleName> = typeof defaultGuildModuleSettings[T];
export type GuildModuleKeys<T extends GuildModuleName> = keyof GuildModuleSetting<T>;
