import { ApplicationEmoji, Collection, GuildEmoji } from 'discord.js'

import client from '@/client/instance'
import { ApplicationEmojiName, currentApplicationEmoji } from '@/client/config/emojis'

type EmojisObject = {
    [Key in ApplicationEmojiName as `${Key & string}Emoji`]: GuildEmoji | ApplicationEmoji;
};

export default function useEmojis(): Partial<EmojisObject> {
    const allEmojis = new Collection<string, GuildEmoji | ApplicationEmoji>([
        ...client.emojis.cache.entries(),
        ...client.application?.emojis.cache.entries() ?? [],
    ]);

    return Object.entries(currentApplicationEmoji)
        .reduce((acc, [emojiName, emojiId]) => {
            const emoji = allEmojis.get(emojiId);

            if (emoji) {
                (acc as any)[`${emojiName}Emoji`] = emoji;
            }

            return acc;
        }, {} as Partial<EmojisObject>);
}