import { ApplicationEmoji, Collection, GuildEmoji } from 'discord.js'

import { ApplicationEmojiName, currentApplicationEmoji } from '@/client/config'
import client from '@/client/instance'

type EmojiHelper = {
    [Key in ApplicationEmojiName as `${Key & string}Emoji`]: GuildEmoji | ApplicationEmoji;
};

export interface ApplicationEmojiHelperOptions {
    fetch?: boolean;
}

export function applicationEmojiHelper(options: { fetch: true }): Promise<Partial<EmojiHelper>>;
export function applicationEmojiHelper(options?: { fetch?: false }): Partial<EmojiHelper>;
export function applicationEmojiHelper(options?: ApplicationEmojiHelperOptions): any {
    const load = (): Partial<EmojiHelper> => {
        const allEmojis = new Collection<string, GuildEmoji | ApplicationEmoji>([
            ...client.emojis.cache.entries(),
            ...client.application?.emojis.cache.entries() ?? [],
        ]);

        return Object.entries(currentApplicationEmoji).reduce((acc: any, [emojiName, emojiId]) => {
            const emoji = allEmojis.get(emojiId);
            if (emoji) {
                acc[`${emojiName}Emoji`] = emoji;
            }
            return acc;
        }, {}) as Partial<EmojiHelper>;
    };

    if (client?.application && options?.fetch) {
        if (options?.fetch) {
            return client.application.emojis.fetch().then(() => load());
        }
    }

    return load();
}