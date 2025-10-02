import { SectionBuilder, APISectionComponent } from 'discord.js'

export type CreateSectionOptions = Omit<APISectionComponent, 'id' | 'type'>

export const createSection = (options: CreateSectionOptions) => {
    return new SectionBuilder(options).toJSON();
}