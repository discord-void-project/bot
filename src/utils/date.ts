export const createCooldown = (timestamp: Date | string | null, duration: number) => {
    const cooldownEndTimestamp = timestamp ? new Date(timestamp).getTime() + duration : duration;
    
    return {
        isActive: Date.now() < cooldownEndTimestamp,
        expireTimestamp: cooldownEndTimestamp,
    };
}