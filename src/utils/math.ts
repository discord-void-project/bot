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

interface TimeElapsedFactorOptions {
    inverse?: boolean;
}

export const timeElapsedFactor = (
    date: number | string | Date | null | undefined,
    days: number,
    options: TimeElapsedFactorOptions = {}
) => {
    const { inverse = false } = options;

    if (!date || days <= 0) {
        return inverse ? 1 : 0
    };

    const timestamp = typeof date === 'number' ? date : new Date(date).getTime();
    if (isNaN(timestamp)) {
        return inverse ? 1 : 0;
    }

    const elapsed = Date.now() - timestamp;
    const msInDay = 1000 * 60 * 60 * 24;
    const ratio = elapsed / (days * msInDay);

    return inverse
        ? Math.max(ratio, 1)
        : Math.min(ratio, 1);
};