import { Locale } from 'discord.js'

export const tzMap = {
    id: 'Asia/Jakarta',
    'en-US': 'America/New_York',
    'en-GB': 'Europe/London',
    bg: 'Europe/Sofia',
    'zh-CN': 'Asia/Shanghai',
    'zh-TW': 'Asia/Taipei',
    hr: 'Europe/Zagreb',
    cs: 'Europe/Prague',
    da: 'Europe/Copenhagen',
    nl: 'Europe/Amsterdam',
    fi: 'Europe/Helsinki',
    fr: 'Europe/Paris',
    de: 'Europe/Berlin',
    el: 'Europe/Athens',
    hi: 'Asia/Kolkata',
    hu: 'Europe/Budapest',
    it: 'Europe/Rome',
    ja: 'Asia/Tokyo',
    ko: 'Asia/Seoul',
    lt: 'Europe/Vilnius',
    no: 'Europe/Oslo',
    pl: 'Europe/Warsaw',
    'pt-BR': 'America/Sao_Paulo',
    ro: 'Europe/Bucharest',
    ru: 'Europe/Moscow',
    'es-ES': 'Europe/Madrid',
    'es-419': 'America/Mexico_City',
    'sv-SE': 'Europe/Stockholm',
    th: 'Asia/Bangkok',
    tr: 'Europe/Istanbul',
    uk: 'Europe/Kiev',
    vi: 'Asia/Ho_Chi_Minh'
};

export const getDateByLocale = (locale: Locale, date?: Date | null) => {
    date ??= new Date();
    return new Date(date.toLocaleString('en-US', { timeZone: tzMap[locale] }));
}

export const createCooldown = (timestamp: Date | string | null, duration: number) => {
    const cooldownEndTimestamp = timestamp ? new Date(timestamp).getTime() + duration : duration;

    return {
        isActive: Date.now() < cooldownEndTimestamp,
        expireTimestamp: cooldownEndTimestamp,
    };
}

export const dateElapsedRatio = (date: undefined | null | number | string | Date, days: number): number => {
    if (typeof date === 'string') {
        date = new Date(date);
        if (isNaN(date.getTime())) {
            return 0;
        }
    }

    if (typeof date !== 'number' && !(date instanceof Date)) {
        return 0
    }

    if (date instanceof Date) {
        date = date.getTime();
    }

    const now = Date.now();
    const elapsed = now - date;

    const msInDay = 1000 * 60 * 60 * 24;
    const totalMs = days * msInDay;

    return +Math.min(1, elapsed / totalMs).toFixed(2);
}