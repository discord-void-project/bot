export type ApplicationEmojiName = 'voiceChannel'
    | 'stageChannel'
    | 'textChannel'
    | 'categoryChannel'
    | 'redArrow'
    | 'greenArrow'
    | 'yellowArrow'
    | 'purpleArrow'
    | 'blueArrow'
    | 'cyanArrow'
    | 'whiteArrow'
    | 'pinkArrow'
    | 'online'
    | 'idle'
    | 'dnd'
    | 'fire';

export const applicationEmojiDev : Record<ApplicationEmojiName, string> = {
    voiceChannel: '1366513582199541800',
    stageChannel: '1366513562784366723',
    textChannel: '1366513550956167189',
    categoryChannel: '1366513539497463848',

    redArrow: '1366512771260481626',
    greenArrow: '1366512787991433236',
    yellowArrow: '1366512779556818954',
    purpleArrow: '1366512763303628810',
    blueArrow: '1373467069768536165',
    cyanArrow: '1373467006795387003',
    whiteArrow: '1373466902801809478',
    pinkArrow: '1373466950726062141',

    online: '1366512708853174343',
    idle: '1366512718399537232',
    dnd: '1366512728239509504',

    fire: '1367567880987873480'
}

export const applicationEmojiProd: Record<ApplicationEmojiName, string>  = {
    voiceChannel: '1342655444484886650',
    stageChannel: '1342655729055826041',
    textChannel: '1342655488348655626',
    categoryChannel: '1342655898392334377',

    redArrow: '1342980251784970361',
    greenArrow: '1343069739978850447',
    yellowArrow: '1342980278804545670',
    purpleArrow: '1342980220394672221',
    blueArrow: '1385819721605316730',
    cyanArrow: '1385819670896050317',
    whiteArrow: '1385819618735816824',
    pinkArrow: '1385819789209112618',

    online: '1342979602468962487',
    idle: '1342979785835544576',
    dnd: '1342979809713848412',

    fire: '1385819506550771772'
} as const

export const currentApplicationEmoji = process.env.ENV === 'DEV'
    ? applicationEmojiDev
    : applicationEmojiProd;

export default currentApplicationEmoji;