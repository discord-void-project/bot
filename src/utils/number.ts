export const formatCompactNumber = (n: string | number, options?: { maximumFractionDigits?: number; }): string =>
    n.toLocaleString('en-US', {
        maximumFractionDigits: 2,
        notation: 'compact',
        compactDisplay: 'short',
    });
    
export const randomNumber = (min: number, max: number, float = false): number => {
    if (min > max) [min, max] = [max, min];
    const num = Math.random() * (max - min) + min;
    return float ? num : Math.floor(num);
};
