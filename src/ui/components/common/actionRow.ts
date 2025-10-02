import {
    ActionRowBuilder,
    APIActionRowComponent,
    APIComponentInMessageActionRow,
    APIComponentInModalActionRow,
} from 'discord.js'

export const createActionRow = <
    ComponentType extends APIComponentInMessageActionRow | APIComponentInModalActionRow
>(components: ComponentType[]): APIActionRowComponent<ComponentType> => {
    return new ActionRowBuilder({ components }).toJSON() as APIActionRowComponent<ComponentType>;
}