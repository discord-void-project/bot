import { Event } from '@/structures'

export default new Event({
    name: 'chatInputInteractionCreate',
    async run({ events: [interaction] }) {
        const command = this.client.commands.resolveSlashCommand({
            commandName: interaction?.commandName,
            subcommandGroupName: interaction.options.getSubcommandGroup(false),
            subcommandName: interaction.options.getSubcommand(false),
        });

        if (!command) return;

        this.client.emit('commandCreate', command, interaction, []);
    }
});
