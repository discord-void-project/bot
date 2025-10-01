import { APIComponentInContainer, APIContainerComponent, ContainerBuilder } from 'discord.js'

import { ColorName, COLORS } from '@/client/config'
import { textDisplay } from './components'

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
        const data: ContainerUICreateMessageData =
            typeof content === 'string'
                ? { ...options, message: content }
                : content;

        const components = [
            data.title ? textDisplay(`### ${data.title}`) : null,
            textDisplay(data.message),
            ...(data.components ?? [])
        ].filter(Boolean) as APIComponentInContainer[]

        return this.create({
            ...data,
            components
        });
    }
}

export default ContainerUI;