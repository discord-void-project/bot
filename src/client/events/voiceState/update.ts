import { Event } from '@/structures'
import { memberService } from '@/database/services'

export default new Event({
	name: 'voiceStateUpdate',
	async run({ events: [oldState, newState] }) {
		const userId = oldState.id;

		if (!oldState.channelId && newState.channelId) {
			this.client.voiceSessions.set(userId, {
				channelId: newState.channelId,
				timestamp: Date.now()
			});
		} else if (oldState.channelId && !newState.channelId) {
			const data = this.client.voiceSessions.get(userId);
			if (!data?.timestamp || !data.channelId) return;

			const minutesElapsed = Math.floor((Date.now() - data.timestamp) / 60000);

			await memberService.updateOrCreate(userId, oldState.guild.id, {
				create: { voiceTotalMinutes: minutesElapsed },
				update: { voiceTotalMinutes: { increment: minutesElapsed } }
			});

			this.client.voiceSessions.delete(userId);
		} else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
			const data = this.client.voiceSessions.get(userId) ?? { timestamp: Date.now() };
			this.client.voiceSessions.set(userId, {
				channelId: newState.channelId,
				timestamp: data.timestamp
			});
		}
	}
});