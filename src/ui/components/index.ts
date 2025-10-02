import {
    APIButtonComponentWithCustomId,
    APIChannelSelectComponent,
    APIStringSelectComponent,
    APIUserSelectComponent,
    APIRoleSelectComponent,
    APIActionRowComponent,
    ButtonStyle,
    ComponentType,
    APIComponentInMessageActionRow,
    APITextDisplayComponent,
    APISeparatorComponent,
    APISectionComponent,
    TextInputStyle,
    APITextInputComponent,
    APIComponentInModalActionRow,
    APIThumbnailComponent,
} from 'discord.js'

export type buttonOptions = Partial<Omit<APIButtonComponentWithCustomId, 'type'>>

const convertLabelToCustomId = (s: string) => s.toLowerCase().replace(/\s+/g, '_')

export const actionRow = <T extends APIComponentInMessageActionRow | APIComponentInModalActionRow>(components: T[]): APIActionRowComponent<T> => {
    return {
        type: ComponentType.ActionRow,
        components
    };
};

const buttonColors = {
    red: ButtonStyle.Danger,
    green: ButtonStyle.Success,
    blue: ButtonStyle.Primary,
    gray: ButtonStyle.Secondary,
}

export type ButtonList = {
    [Key in keyof typeof buttonColors]: (label: string | APIButtonComponentWithCustomId, options?: buttonOptions) => APIButtonComponentWithCustomId;
}

export const button: ButtonList = Object.keys(buttonColors).reduce((acc, key: keyof ButtonList) => {
    acc[key] = (label: string | APIButtonComponentWithCustomId, options: buttonOptions = {}): APIButtonComponentWithCustomId => {
        const defaultPayload = {
            type: ComponentType.Button,
            style: buttonColors[key],
            custom_id: options?.custom_id ?? `btn_${convertLabelToCustomId(typeof label === 'string' ? label : options.label ?? (Math.random() * 1000).toString())}`
        } as APIButtonComponentWithCustomId

        return typeof label === 'object'
            ? { ...label, ...defaultPayload }
            : { label, ...options, ...defaultPayload }
    };

    return acc;
}, {} as ButtonList)

export const selectMenu = {
    string(options: Omit<APIStringSelectComponent, 'type'>): APIStringSelectComponent {
        return {
            type: ComponentType.StringSelect,
            ...options
        }
    },
    role(options: Omit<APIRoleSelectComponent, 'type'>): APIRoleSelectComponent {
        return {
            type: ComponentType.RoleSelect,
            ...options
        }
    },
    channel(options: Omit<APIChannelSelectComponent, 'type'>): APIChannelSelectComponent {
        return {
            type: ComponentType.ChannelSelect,
            ...options
        }
    },
    user(options: Omit<APIUserSelectComponent, 'type'>): APIUserSelectComponent {
        return {
            type: ComponentType.UserSelect,
            ...options
        }
    },
}

export const textDisplay = (content: string): APITextDisplayComponent => {
    return {
        type: ComponentType.TextDisplay,
        content
    }
}

export const separator = (options?: { large?: boolean, divider?: boolean }): APISeparatorComponent => {
    return {
        spacing: options?.large ? 2 : 1,
        divider: options?.divider ?? true,
        type: ComponentType.Separator,
    }
}

export const section = (options: Omit<APISectionComponent, 'type'>): APISectionComponent => {
    return {
        ...options,
        type: ComponentType.Section,
    }
}

interface TextInputOptions extends Omit<
    APITextInputComponent,
    'style'
    | 'custom_id'
    | 'label'
    | 'type'
> {
    customId?: string;
    isParagraph?: boolean;
    label?: string;
}

export const textInput = (label: string, options?: TextInputOptions): APITextInputComponent => {
    const { isParagraph, ...data } = options ?? {} as TextInputOptions;

    return {
        style: isParagraph ? TextInputStyle.Paragraph : TextInputStyle.Short,
        label,
        ...data,
        type: ComponentType.TextInput,
        custom_id: data?.customId ?? `txt_${convertLabelToCustomId(label)}`
    }
}

export const thumbnail = (url: string, options?: APIThumbnailComponent): APIThumbnailComponent => {
    return {
        type: ComponentType.Thumbnail,
        media: { url }
    }
}