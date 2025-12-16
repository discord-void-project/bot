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
    callMutedMultiplier: 0.50,
    callDeafMultiplier: 0.0,
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
