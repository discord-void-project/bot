export const jsonToMarkdown = (json: any, language = 'json') => {
    return `\`\`\`${language}\n${json}\`\`\``
}