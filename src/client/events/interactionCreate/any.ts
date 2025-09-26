import { Event } from '@/structures'

export default new Event({
    name: 'interactionCreate',
    async run({ events: [interaction] }) {
        if (interaction.isChatInputCommand()) {
            this.client.emit('chatInputInteractionCreate', interaction);
        } else if (interaction.isButton()) {
            this.client.emit('buttonInteractionCreate', interaction);
        }
    }
});
