import { SeparatorBuilder, SeparatorSpacingSize } from 'discord.js'

export type SeparatorOptions = {
    large?: boolean;
    divider?: boolean;
}

export const createSeparator = (options?: SeparatorOptions) => {
    return new SeparatorBuilder({
        spacing: options?.large
            ? SeparatorSpacingSize.Large
            : SeparatorSpacingSize.Small,
        divider: options?.divider ?? true
    }).toJSON();
}