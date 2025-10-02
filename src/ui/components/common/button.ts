import {
    APIButtonComponent,
    ButtonBuilder,
    ButtonComponentData,
    ButtonStyle
} from 'discord.js'

export enum CreateButtonColor {
    Blue = ButtonStyle.Primary,
    Gray = ButtonStyle.Secondary,
    Green = ButtonStyle.Success,
    Red = ButtonStyle.Danger,
}

type CreateButtonData = Omit<ButtonComponentData, 'id' | 'type' | 'style'> & {
    color?: CreateButtonColor | Lowercase<keyof typeof CreateButtonColor>;
    customId: string;
}

function resolveColor(color?: string | CreateButtonColor | ButtonStyle): number {
    if (!color) return ButtonStyle.Primary;

    if (typeof color === 'string') {
        return CreateButtonColor[
            color.toCapitalize() as keyof typeof CreateButtonColor
        ] ?? ButtonStyle.Primary;
    }

    return color;
}

export function createButton(options: CreateButtonData): APIButtonComponent
export function createButton(label: string, options?: Omit<CreateButtonData, 'label'>): APIButtonComponent
export function createButton(label: string, customId: string, options?: Omit<CreateButtonData, 'label' | 'customId'>): APIButtonComponent
export function createButton(
    arg1: string | CreateButtonData,
    arg2?: string | Omit<CreateButtonData, 'label'>,
    arg3?: Omit<CreateButtonData, 'label' | 'customId'>
): APIButtonComponent {
    let data: Partial<CreateButtonData> = {};

    if (typeof arg1 === 'object') {
        data = arg1;
    } else if (typeof arg2 === 'object') {
        data = { ...arg2, label: arg1 };
    } else if (typeof arg2 === 'string' && typeof arg3 === 'object') {
        data = { ...arg3, label: arg1, customId: arg2 };
    }

    if (typeof arg2 === 'string' && !arg3) {
        data.customId = arg2;
    }

    return new ButtonBuilder({
        ...data,
        style: resolveColor(data.color)
    }).toJSON();
}
