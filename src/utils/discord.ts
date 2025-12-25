import {
    escapeMarkdown,
    MessageMentions,
} from 'discord.js'

export const escapeAllMarkdown = (text: string) => escapeMarkdown(text, {
    bold: true,
    bulletedList: true,
    codeBlock: true,
    codeBlockContent: true,
    escape: true,
    heading: true,
    inlineCode: true,
    inlineCodeContent: true,
    italic: true,
    maskedLink: true,
    numberedList: true,
    spoiler: true,
    strikethrough: true,
    underline: true
});

export const escapeSafe = (str: string) => {
    return str.replace(/[^\p{Script=Latin}\p{N}._\- :]/gu, '');
};

export const parseUserMention = (mention: string | null) => {
    if (!mention) return null;
    return mention.match(MessageMentions.UsersPattern)?.[1] ?? null;
}