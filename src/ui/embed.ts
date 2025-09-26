import { APIEmbed } from 'discord.js'

import configColors, { configColors as colors } from '@/client/config/colors'

type EmbedColors = Lowercase<keyof typeof configColors>;

export type Embed = {
    [Key in EmbedColors]: (message: string | APIEmbed, options?: Partial<APIEmbed>) => APIEmbed;
}

const embed : Embed = Object
    .keys(colors)
    .reduce((acc: any, key: EmbedColors) => {
        acc[key.toLowerCase()] = (message: string | APIEmbed, options: Partial<APIEmbed> = {}): APIEmbed => {
            const colorKey = key.toUpperCase() as Uppercase<EmbedColors>;

            return typeof message === 'object'
                ? { ...message, color: colors[colorKey] ?? 0x0 }
                : { ...options, color: colors[colorKey] ?? 0x0, description: message };
        };

        return acc;
    }, {} as Embed)

export default embed;