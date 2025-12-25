export const PrismaUserFlags = {
    STAFF: 1 << 0,
    BETA: 1 << 1,
    PARTNER: 1 << 2,
} as const;

export type PrismaUserFlagsString = keyof typeof PrismaUserFlags;