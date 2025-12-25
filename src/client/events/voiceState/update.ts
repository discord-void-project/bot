import { Event } from '@/structures'

export default new Event({
    name: 'voiceStateUpdate',
    async run({ events: [oldState, newState] }) {
        const userId = oldState.id;
        const guildId = oldState.guild.id;

        const manager = this.client.callSessions;

        if (!oldState.channelId && newState.channelId) {
            return manager.start(userId, newState);
        }

        if (oldState.channelId && !newState.channelId) {
            await manager.flush(userId, guildId);
            return manager.stop(userId);
        }

        return await manager.update(userId, newState);
    }
});
