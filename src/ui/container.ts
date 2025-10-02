import { APIContainerComponent, ComponentType } from 'discord.js'

import { configColors as colors } from '@/client/config/colors'
import { textDisplay } from './components'

type ContainerOptions = Omit<APIContainerComponent, 'type' | 'id'>;

type ContainerConfigColors = Lowercase<keyof typeof colors>;
type ContainerColors = ContainerConfigColors | 'transparent' | 'custom';

export type Container = {
    [Key in ContainerColors]: (message: string | ContainerOptions, options?: Partial<ContainerOptions>) => APIContainerComponent;
}

const colorsKeys = [ ...Object.keys(colors), 'transparent', 'custom' ];

const container : Container = colorsKeys.reduce((acc, key: ContainerColors) => {
        acc[key.toLowerCase() as ContainerColors] = (options: string | ContainerOptions): APIContainerComponent => {
            const defaultPayload = {
                type: ComponentType.Container,
            } as APIContainerComponent

            if (typeof options === 'object' && key === 'custom') {
                defaultPayload.accent_color = options.accent_color;
            } else {
                defaultPayload.accent_color = colors[key.toUpperCase() as Uppercase<ContainerConfigColors>]
            }

            return typeof options === 'object'
                ? { ...options, ...defaultPayload }
                : { ...defaultPayload, components: [textDisplay(options)] };
        };

        return acc;
    }, {} as Container)

export default container;