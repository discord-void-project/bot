import { applicationEmojiHelper } from '@/helpers'

type ProgressBarOptions = {
    length?: number;
    filledChar?: string;
    emptyChar?: string;
    showPercentage?: boolean
};

export const createProgressBar = (progress: number, options?: ProgressBarOptions) => {
    const { whiteRectEmoji, greenRectEmoji } = applicationEmojiHelper();

    const length = options?.length ?? 10;
    const filledChar = options?.filledChar ?? `${greenRectEmoji ?? '🟩'}`;
    const emptyChar = options?.emptyChar ?? `${whiteRectEmoji ?? '⬜'}`;
    const showPercentage = options?.showPercentage ?? false;

    const clamped = Math.max(0, Math.min(progress, 1));
    const filledCount = Math.round(clamped * length);
    const emptyCount = length - filledCount;

    const bar = filledChar.repeat(filledCount) + emptyChar.repeat(emptyCount);
    const percentage = showPercentage ? ` **${Math.round(clamped * 100)}%**` : '';

    return bar.concat(percentage);
}
