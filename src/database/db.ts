import { PrismaClient } from './core/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

import logger from '@/utils/logger'

import {
    userExtension,
    shopExtension,
    memberExtension,
} from './extensions'

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectTimeout: 5000
});

const prisma = new PrismaClient({ adapter })
    .$extends(userExtension)
    .$extends(shopExtension)
    .$extends(memberExtension);

export default Object.assign(prisma, {
    adapter,
    logger: logger.use({
        prefix: (c) => c.white(`[${c.cyanBright(`PRISMA`)}] <🗄️>`)
    })
});