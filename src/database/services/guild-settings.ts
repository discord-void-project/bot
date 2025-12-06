import prisma from '@/database/db'

export const defaultGuildSettings = {
    eco: {
        isActive: true,

        // Message
        isCoinsMessageEnabled: true,
        messageLuck: 30,
        messageMinGain: 8,
        messageMaxGain: 24,

        // Voice
        isCoinsVoiceEnabled: true,
        voiceGainInterval: 15,
        voiceMaxGain: 24,
        voiceMinGain: 40,

        // Daily
        isDailyEnabled: true,
        dailyMinGain: 500,
        dailyMaxGain: 700,

        // Work
        isWorkEnabled: true,
        workCooldown: 60,
        workMinGain: 200,
        workMaxGain: 500,

        // Shop
        isShopEnabled: false,
    },
    progression: {
        isActive: true,

        // Message
        isXpMessageEnabled: true,
        messageLuck: 20,
        messageMinGain: 4,
        messageMaxGain: 12,

        // Voice
        isXpVoiceEnabled: true,
        voiceGainInterval: 15,
        voiceMinGain: 12,
        voiceMaxGain: 20,

        // Growth
        maxLevel: 100,
    },
};

const findOrCreate = async(
    guildId: string,
    name: any
): Promise<any> => {
    const { options } = await prisma.guildSettings.upsert({
        where: {
            guildId_name: {
                guildId,
                name: name
            },
        },
        update: {},
        create: {
            guild: {
                connectOrCreate: {
                    create: { id: guildId },
                    where: { id: guildId }
                }
            },
            name,
            options: (defaultGuildSettings as any)[name]
        },
    });

    return options;
}

const updateOrCreate = async(
    guildId: string,
    name: any,
    options?: any
): Promise<any> => {
    const defaultOptions = (defaultGuildSettings as any)[name];
    const oldOptions = await findOrCreate(guildId, name);

    const optionsMerged = { ...oldOptions, ...options };
    const optionsAllowed = Object.keys(defaultOptions);

    const validOptions = Object.fromEntries(
        Object.entries(optionsMerged).filter(([k]) => optionsAllowed.includes(k))
    );

    const cleanOptions = { ...defaultOptions, ...validOptions };

    const settings = await prisma.guildSettings.upsert({
        where: {
            guildId_name: {
                guildId,
                name: name
            },
        },
        update: {
            options: cleanOptions
        },
        create: {
            guild: {
                connectOrCreate: {
                    create: { id: guildId },
                    where: { id: guildId }
                }
            },
            name,
            options: cleanOptions
        },
    });

    return settings.options;
}

const findManyOrCreate = async (
    guildId: string,
    names: any
): Promise<any> => {
    const results = {} as any;

    await Promise.all(
        names.map(async (name: any) => {
            results[name] = await findOrCreate(guildId, name) as any;
        })
    );

    return results;
};

export const guildSettingsService = {
    defaultGuildSettings,
    findOrCreate,
    updateOrCreate,
    findManyOrCreate,
}