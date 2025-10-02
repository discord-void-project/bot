import { APIComponentInContainer, APIContainerComponent, ContainerBuilder } from 'discord.js'

import { ColorName, COLORS } from '@/client/config'
import { applicationEmojiHelper } from '@/helpers'
import { createTextDisplay } from './components/common'

type ContainerUIData = Omit<APIContainerComponent, 'id' | 'type' | 'accent_color'> & {
    color?: ColorName | number | undefined
};

type ContainerUICreateMessageDataOptions = Partial<ContainerUIData> & {
    title?: string;
}

type ContainerUICreateMessageData = ContainerUICreateMessageDataOptions & {
    title?: string;
    message: string
}

export class ContainerUI {
    static create(data: ContainerUIData) {
        if (data?.color && typeof data.color !== 'number') {
            data.color = COLORS[data.color]
        }

        return new ContainerBuilder({
            ...data,
            accent_color: data?.color as number | undefined
        }).toJSON();
    }

    static createMessage(
        content: string | ContainerUICreateMessageData,
        options?: ContainerUICreateMessageDataOptions
    ) {
        const data = typeof content === 'string'
            ? { ...options, message: content }
            : content;

        const components = [
            data.title ? createTextDisplay(`### ${data.title}`) : null,
            createTextDisplay(data.message),
            ...(data.components ?? [])
        ].filter(Boolean) as APIComponentInContainer[]

        return this.create({
            ...data,
            components
        });
    }

    static createInfoMessage(
        content: string | Omit<ContainerUICreateMessageData, 'color'>,
        options?: Omit<ContainerUICreateMessageDataOptions, 'color'>
    ) {
        const { blueBulletEmoji } = applicationEmojiHelper();

        const normalized: ContainerUICreateMessageData =
            typeof content === 'object'
                ? { ...content }
                : { ...options, message: content };

        return this.createMessage({
            ...normalized,
            message: `${blueBulletEmoji} ${normalized.message}`,
            color: COLORS.blue
        });
    }

    static createSuccessMessage(
        content: string | Omit<ContainerUICreateMessageData, 'color'>,
        options?: Omit<ContainerUICreateMessageDataOptions, 'color'>
    ) {
        const { greenBulletEmoji } = applicationEmojiHelper();

        const normalized: ContainerUICreateMessageData =
            typeof content === 'object'
                ? { ...content }
                : { ...options, message: content };

        return this.createMessage({
            ...normalized,
            message: `${greenBulletEmoji} ${normalized.message}`,
            color: COLORS.green
        });
    }

    static createWarnMessage(
        content: string | Omit<ContainerUICreateMessageData, 'color'>,
        options?: Omit<ContainerUICreateMessageDataOptions, 'color'>
    ) {
        const { yellowBulletEmoji } = applicationEmojiHelper();

        const normalized: ContainerUICreateMessageData =
            typeof content === 'object'
                ? { ...content }
                : { ...options, message: content };

        return this.createMessage({
            ...normalized,
            message: `${yellowBulletEmoji} ${normalized.message}`,
            color: COLORS.yellow
        });
    }

    static createErrorMessage(
        content: string | Omit<ContainerUICreateMessageData, 'color'>,
        options?: Omit<ContainerUICreateMessageDataOptions, 'color'>
    ) {
        const { redBulletEmoji } = applicationEmojiHelper();

        const normalized: ContainerUICreateMessageData =
            typeof content === 'object'
                ? { ...content }
                : { ...options, message: content };

        return this.createMessage({
            ...normalized,
            message: `${redBulletEmoji} ${normalized.message}`,
            color: COLORS.red
        });
    }
}

export default ContainerUI;