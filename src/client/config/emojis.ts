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
    | 'lightGraySubEntry'
    | 'redSubEntry'
    | 'greenSubEntry'
    | 'lightGrayBullet'
    | 'yellowSubEntry'
    | 'graySubEntry'
    | 'yellowBullet'
    | 'redBullet'
    | 'blueBullet'
    | 'greenBullet'
    | 'whiteRect'
    | 'greenRect'
    | 'yellowRect'
    | 'redRect'
    | 'indogoRect'
    | 'empty'
    | 'abyssMarked'
    | 'abyssUnmarked'
    | 'abyssLine';

export type ArrowColorName = 'red'
    | 'green'
    | 'purple'
    | 'blue'
    | 'yellow'
    | 'cyan'
    | 'white'
    | 'pink';

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

    graySubEntry: '1412969509047894137',
    yellowSubEntry: '1412969535136468992',
    lightGraySubEntry: '1412972355080290334',
    redSubEntry: '1412972290240544868',
    greenSubEntry: '1412972394016018432',

    blueBullet: '1418433617238950038',
    greenBullet: '1412969556682739926',
    yellowBullet: '1412969569076904046',
    lightGrayBullet: '1412972142584135771',
    redBullet: '1412972111928103024',

    whiteRect: '1423334828551573588',
    yellowRect: '1423335622499766432',
    redRect: '1423335629172904220',
    greenRect: '1423334822482546801',
    indogoRect: '1423335752284115155',

    empty: '1412970747907014656',

    online: '1366512708853174343',
    idle: '1366512718399537232',
    dnd: '1366512728239509504',

    abyssMarked: '1447983820250021888',
    abyssUnmarked: '1447983183663595562',
    abyssLine: '1447984625359130685'
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

    graySubEntry: '1423306275915300864',
    yellowSubEntry: '1423306341190996030',
    lightGraySubEntry: '1423306399026516018',
    redSubEntry: '1423306471822725152',
    greenSubEntry: '1423306524117434408',

    blueBullet: '1423305990958223482',
    greenBullet: '1423306041751371916',
    yellowBullet: '1423306085636374530',
    lightGrayBullet: '1423306128816738365',
    redBullet: '1423306178280296458',

    whiteRect: '1423361609933525103',
    yellowRect: '1423361596138192977',
    redRect: '1423361587154260238',
    greenRect: '1423361602073264341',
    indogoRect: '1423361570502738071',

    empty: '1423305833587933307',

    online: '1342979602468962487',
    idle: '1342979785835544576',
    dnd: '1342979809713848412',

    abyssMarked: '',
    abyssUnmarked: '',
    abyssLine: ''
} as const

export const currentApplicationEmoji = process.env.ENV === 'DEV'
    ? applicationEmojiDev
    : applicationEmojiProd;

export default currentApplicationEmoji;