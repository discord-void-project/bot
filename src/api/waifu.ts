export type waifuAPICategories = 'waifu'
    | 'neko'
    | 'shinobu'
    | 'megumin'
    | 'bully'
    | 'cuddle'
    | 'cry'
    | 'hug'
    | 'awoo'
    | 'kiss'
    | 'lick'
    | 'pat'
    | 'smug'
    | 'bonk'
    | 'yeet'
    | 'blush'
    | 'smile'
    | 'wave'
    | 'highfive'
    | 'handhold'
    | 'nom'
    | 'bite'
    | 'glomp'
    | 'slap'
    | 'kill'
    | 'kick'
    | 'happy'
    | 'wink'
    | 'poke'
    | 'dance'
    | 'cringe';

export const waifuAPI = async (category: waifuAPICategories): Promise<string> => {
    return await fetch(`https://api.waifu.pics/sfw/${category}`)
        .then((res) => res.json())
        .then((res) => res.url);
}