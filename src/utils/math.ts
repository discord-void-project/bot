export const BASE_XP = 200;
export const BASE_FACTOR = 1.2;

export const xpToLevel = (experience: number) => {
    return Math.floor(Math.pow(experience / BASE_XP, 1 / BASE_FACTOR)) + 1;
}

export const levelToXp = (level: number) => {
    return Math.floor(BASE_XP * Math.pow(level, BASE_FACTOR));
}

export const xpToNextLevel = (currentXp: number) => {
    const currentLevel = xpToLevel(currentXp);
    const nextLevelXp = levelToXp(currentLevel);

    return nextLevelXp - currentXp;
}

export const getXpProgress = (currentXp: number) => {
    const currentLevel = xpToLevel(currentXp);
    const xpAtCurrentLevel = levelToXp(currentLevel - 1);
    const xpAtNextLevel = levelToXp(currentLevel);

    const currentLevelProgress = currentXp - xpAtCurrentLevel;
    const requiredXp = xpAtNextLevel - xpAtCurrentLevel;

    return {
        current: currentLevelProgress,
        required: requiredXp
    };
}

// NEW

// const BASE_XP = 200;
// const BASE_FACTOR = 1.1;
// const INTENSITY = 0.8;
// const SCALE = 12;

// function dynamicFactor(level) {
//     return BASE_FACTOR + INTENSITY * (1 - Math.exp(-level / SCALE));
// }

// function xpToLevel(xp) {
//     if (xp <= 0) return 1;

//     const rough = Math.pow(xp / BASE_XP, 1 / BASE_FACTOR) + 1;
//     const factor = dynamicFactor(rough);
//     const level = Math.pow(xp / BASE_XP, 1 / factor) + 1;

//     return Math.floor(level);
// }

// function levelToXp(level) {
//     if (level <= 1) return 0;

//     const factor = dynamicFactor(level);

//     return Math.floor(BASE_XP * Math.pow(level - 1, factor));
// }