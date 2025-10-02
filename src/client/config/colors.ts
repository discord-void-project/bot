export const COLORS = {
    red: 0xff4c4c,
    green: 0x8eff61,
    blue: 0x4a9bff,
    gray: 0x696969,
    purple: 0xb16fff,
    orange: 0xff8e55,
    yellow: 0xf5cb3a,
    lightGray: 0xc2c2c2,
    indigo: 0X6886FF,
} as const;

export type ColorName = keyof typeof COLORS;