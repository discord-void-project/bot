export const levelToXp = (level: number) => {
    if (level <= 1) return 0
    return Math.floor(1000 * (Math.pow((level - 1), 2) / 4) + (3 * level) + 750);
}

export const xpToLevel = (xp: number) => {
    const a = 1000 / 4;
    const b = 3 - 2 * a;
    const c = a + 750 - xp;

    const delta = b * b - 4 * a * c;
    if (delta <= 0) return 1;

    return Math.max(1, Math.floor((-b + Math.sqrt(delta)) / (2 * a)));
}

export const xpToNextLevel = (xp: number) => {
    const currentLevel = xpToLevel(xp);
    const currentLevelXp = levelToXp(currentLevel);
    const nextLevel = currentLevel + 1;
    const nextLevelXp = levelToXp(nextLevel);

    const xpProgress = xp - currentLevelXp;
    const xpForLevel = nextLevelXp - currentLevelXp;

    return {
        currentXp: xp,
        currentLevel,
        currentLevelXp,
        nextLevel,
        nextLevelXp,
        xpProgress,
        xpForLevel
    };
}