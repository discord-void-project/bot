import { EmbedBuilder, EmbedData } from 'discord.js'

import { ColorName, COLORS } from '@/client/config'
import { applicationEmojiHelper } from '@/helpers'

export type EmbedUIData = Omit<EmbedData, 'color'> & {
    color?: ColorName | number | undefined
};

export class EmbedUI {
    static create(data: EmbedUIData) {
        if (data.color && typeof data.color !== 'number') {
            data.color = COLORS[data.color] ?? 0x0
        }

        return new EmbedBuilder(data as EmbedData).toJSON();
    }

    static createMessage(
        content: string | EmbedUIData,
        options?: Omit<EmbedUIData, 'description'>
    ) {
        if (typeof content === 'string') {
            content = {
                description: content
            }
        }

        return this.create({
            ...options,
            ...content
        });
    }

    static createInfoMessage(
        content: string | Omit<EmbedUIData, 'color'>,
        options?: Omit<EmbedUIData, 'color'>
    ) {
        const { blueBulletEmoji } = applicationEmojiHelper();

        const normalized: EmbedUIData =
            typeof content === 'object'
                ? { ...content }
                : { ...options, description: content };

        return this.createMessage({
            ...normalized,
            description: `${blueBulletEmoji} ${normalized?.description}`,
            color: COLORS.blue
        });
    }

    static createSuccessMessage(
        content: string | Omit<EmbedUIData, 'color'>,
        options?: Omit<EmbedUIData, 'color'>
    ) {
        const { greenBulletEmoji } = applicationEmojiHelper();

        const normalized: EmbedUIData =
            typeof content === 'object'
                ? { ...content }
                : { ...options, description: content };

        return this.createMessage({
            ...normalized,
            description: `${greenBulletEmoji} ${normalized.description}`,
            color: COLORS.green
        });
    }

    static createWarnMessage(
        content: string | Omit<EmbedUIData, 'color'>,
        options?: Omit<EmbedUIData, 'color'>
    ) {
        const { yellowBulletEmoji } = applicationEmojiHelper();

        const normalized: EmbedUIData =
            typeof content === 'object'
                ? { ...content }
                : { ...options, description: content };

        return this.createMessage({
            ...normalized,
            description: `${yellowBulletEmoji} ${normalized.description}`,
            color: COLORS.yellow
        });
    }

    static createErrorMessage(
        content: string | Omit<EmbedUIData, 'color'>,
        options?: Omit<EmbedUIData, 'color'>
    ) {
        const { redBulletEmoji } = applicationEmojiHelper();

        const normalized: EmbedUIData =
            typeof content === 'object'
                ? { ...content }
                : { ...options, description: content };

        return this.createMessage({
            ...normalized,
            description: `${redBulletEmoji} ${normalized.description}`,
            color: COLORS.red
        });
    }
}

export default EmbedUI;