export const defaultEcoGuildSettings = {
    isActive: false,

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

    // Shop
    isShopEnabled: false,
}

export const defaultLevelGuildSettings = {
    isActive: false,

    // Message
    isXpFromMessageEnabled: true,
    messageChance: 0.2,

    // Call
    isXpFromCallEnabled: true,
    callGainIntervalMinutes: 15,

    // Growth
    maxLevel: 100,
}

export const defaultGuildSettings = {
    eco: defaultEcoGuildSettings,
    level: defaultLevelGuildSettings
};