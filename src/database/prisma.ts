import { PrismaClient } from '@prisma/client'
import logger from '@/utils/logger'

import { userExtension, memberExtension } from './extensions'

export const prismaLogger = logger.use({
    prefix: (c) => c.white(`[${c.cyanBright(`PRISMA`)}] <🗄️>`)
});

const prisma = new PrismaClient()
    .$extends(userExtension)
    .$extends(memberExtension);

export default prisma;