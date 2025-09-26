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
