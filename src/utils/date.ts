export const createCooldown = (timestamp: Date | string | null, duration: number) => {
    const cooldownEndTimestamp = timestamp ? new Date(timestamp).getTime() + duration : duration;

    return {
        isActive: Date.now() < cooldownEndTimestamp,
        expireTimestamp: cooldownEndTimestamp,
    };
}

export const dateElapsedRatio = (date: number | Date, days: number): number => {
    if (date instanceof Date) {
        date = date.getTime();
    }

    const now = Date.now();
    const elapsed = now - date;

    const msInDay = 1000 * 60 * 60 * 24;
    const totalMs = days * msInDay;

    return +Math.min(1, elapsed / totalMs).toFixed(2);
}