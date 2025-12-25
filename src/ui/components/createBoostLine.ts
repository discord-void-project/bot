import { ArrowColorName } from '@/client/config'
import { applicationEmojiHelper } from '@/helpers'

interface CreateBoostLineOptions {
    label: string;
    value: string | number;
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

    if (typeof value === 'string') {
        value = parseInt(value);
    }

    const sign = value > 0
        ? '+'
        : value < 0
            ? '-'
            : '';

    const displayValue = Math.abs(value).toLocaleString('en', {
        maximumFractionDigits: 2
    });

    return typeof max === 'number'
        ? `${label} ${arrow} **${sign}${displayValue}%** / **${max}% MAX**`
        : `${label} ${arrow} **${sign}${displayValue}%**`;
};