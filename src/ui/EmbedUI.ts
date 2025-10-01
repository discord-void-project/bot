import { ColorName, COLORS } from '@/client/config'
import { EmbedBuilder, EmbedData } from 'discord.js'

type EmbedUIData = Omit<EmbedData, 'color'> & {
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
}

export default EmbedUI;