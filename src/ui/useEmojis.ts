import { ApplicationEmoji, Collection, GuildEmoji } from 'discord.js'

import client from '@/client/instance'
import config from '@/client/config/emojis'

type EmojisList = typeof config;

type EmojisObject = {
    [Key in keyof EmojisList as `${Key & string}Emoji`]: GuildEmoji | ApplicationEmoji;
};

export default function useEmojis(): Partial<EmojisObject> {
    const allEmojis = new Collection<string, GuildEmoji | ApplicationEmoji>([
        ...client.emojis.cache.entries(),
        ...client.application?.emojis.cache.entries() ?? [],
    ]);

    return Object.entries(config)
        .reduce((acc, [emojiName, emojiId]) => {
            const emoji = allEmojis.get(emojiId);

            if (emoji) {
                (acc as any)[`${emojiName}Emoji`] = emoji;
            }

            return acc;
        }, {} as Partial<EmojisObject>);
}