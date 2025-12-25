import { Event } from '@/structures'

export default new Event({
    name: 'channelUpdate',
    async run({ events: [oldChannel, newChannel] }) {
        if (!newChannel.isVoiceBased()) return;

        const everyonePerm = newChannel.permissionsFor(newChannel.guild.roles.everyone);
        const isPrivate = everyonePerm ? !(everyonePerm.has('Connect') && everyonePerm.has('ViewChannel')) : false;

        for (const [_, session] of this.client.callSessions.cache) {
            if (session.channelId === newChannel.id) {
                session.flags.isPrivate = isPrivate;
            }
        }
    }
});
