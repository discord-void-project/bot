export const jsonToMarkdown = (json: any, language = 'json') => {
    return `\`\`\`${language}\n${JSON.stringify(json, null, 4)}\`\`\``
}

export const isOnlySpaces = (str: string) => {
    return str.trim().length === 0
};

export function formatTimeLeft(
    expireTimestamp: number,
    now = Date.now(),
    withSeconds = false
): string {
    const remaining = Math.max(0, expireTimestamp - now);

    const hours = Math.floor(remaining / 3_600_000);
    const minutes = Math.floor((remaining % 3_600_000) / 60_000);
    const seconds = Math.floor((remaining % 60_000) / 1_000);

    if (hours > 0) {
        return withSeconds
            ? `**${hours}h ${minutes}min ${seconds}'s**`
            : `**${hours}h ${minutes}min**`;
    }

    if (minutes > 0) {
        return withSeconds ? `**${minutes}min ${seconds}'s**` : `**${minutes}min**`;
    }

    return `**${seconds}'s**`;
}
