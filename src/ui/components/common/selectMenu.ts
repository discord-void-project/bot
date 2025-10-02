import {
    StringSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    UserSelectMenuBuilder,
    StringSelectMenuComponentData,
    RoleSelectMenuComponentData,
    ChannelSelectMenuComponentData,
    UserSelectMenuComponentData,
} from 'discord.js'

export type CreateStringSelectMenuOptions = Omit<StringSelectMenuComponentData, 'type' | 'id'>
export type CreateRoleSelectMenuOptions = Omit<RoleSelectMenuComponentData, 'type' | 'id'>
export type CreateChannelSelectMenuOptions = Omit<ChannelSelectMenuComponentData, 'type' | 'id'>
export type CreateUserSelectMenuOptions = Omit<UserSelectMenuComponentData, 'type' | 'id'>

export const createStringSelectMenu = (options: CreateStringSelectMenuOptions) => {
    return new StringSelectMenuBuilder(options).toJSON();
}

export const createRoleSelectMenu = (options: CreateRoleSelectMenuOptions) => {
    return new RoleSelectMenuBuilder(options).toJSON();
}

export const createChannelSelectMenu = (options: CreateChannelSelectMenuOptions) => {
    return new ChannelSelectMenuBuilder(options).toJSON();
}

export const createUserSelectMenu = (options: CreateUserSelectMenuOptions) => {
    return new UserSelectMenuBuilder(options).toJSON();
}