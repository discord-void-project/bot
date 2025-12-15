import { ArrowColorName } from '@/client/config'
import { applicationEmojiHelper } from '@/helpers'

interface CreateBoostLineOptions {
    label: string;
    value: number;
    max?: number;
    arrowColor?: ArrowColorName
}

export const createBoostLine = ({
    label,
    value,
    max,
    arrowColor
}: CreateBoostLineOptions): string => {
    const emojis = applicationEmojiHelper();
    const arrow = emojis?.[`${arrowColor ?? 'white'}ArrowEmoji`]

    value = Math.floor(value);
    max = Math.floor(max ?? 0);

    const sign = value > 0
        ? '+'
        : value < 0
            ? '-'
            : '';

    const displayValue = Math.abs(value).toLocaleString('en');

    return typeof max === 'number'
        ? `${label} ${arrow} **${sign}${displayValue}%** / **${Math.floor(max)}% MAX**`
        : `${label} ${arrow} **${sign}${displayValue}%**`;
};