import { TextDisplayBuilder } from 'discord.js'

export const createTextDisplay = (content: string) => {
    return new TextDisplayBuilder({ content }).toJSON();
}