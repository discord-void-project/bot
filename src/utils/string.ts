export const jsonToMarkdown = (json: any, language = 'json') => {
    return `\`\`\`${language}\n${JSON.stringify(json, null, 4)}\`\`\``
}

export const isOnlySpaces = (str: string) => {
    return str.trim().length === 0
};
