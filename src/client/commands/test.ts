import { MessageFlags } from 'discord.js'
import { Command } from '@/structures'

import ContainerUI from '@/ui/ContainerUI'
import { actionRow, button, separator } from '@/ui/components'

export default new Command({
    async onMessage(message, ctx) {
        return await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                ContainerUI.createMessage('test', {
                    color: 'indigo',
                    title: "Voulez-vous mourir ?",
                    components: [
                        separator(),
                        actionRow([
                            button.green('Oui')
                        ])
                    ]
                })
            ]
        })
    },
});
