import 'dotenv/config'

const validEnv = ['DEV', 'PROD'];

const env = process.env.ENV;
if (!env || !validEnv.some((v) => v === env)) {
    throw new Error(`ENV must be one of: ${validEnv.join(', ')}`);
}

import './helpers/extends/String'
import './helpers/extends/Math'

import pkg from '@pkg'
import { version as djsVersion } from 'discord.js'
import { Prisma } from './database/core/client'

import logger from './utils/logger'
import client from './client/instance'

import { GlobalFonts } from '@napi-rs/canvas'
import path from 'path'

GlobalFonts.registerFromPath(path.join(
    process.cwd(),
    'src',
    'ui',
    'assets',
    'fonts',
    'Quantico-Bold.ttf'
), 'Quantico Bold');

const projectName = pkg.name.toCapitalize();
process.title = `${projectName} - Terminal`

const entries = [
    ['ENV', env],
    ['DEBUG', process.env.DEBUG == 'true' ? '✅' : '❌'],
    ['Node', process.version],
    ['Discord.js', `v${djsVersion}`],
    ['Prisma', `v${Prisma.prismaVersion.client}`],
] as const;

const maxLabelLength = Math.max(...entries.map(([label]) => label.length));

logger.topBorderBox(({ cyanBright }) => cyanBright(projectName));
for (let [label, value] of entries) {
    logger.borderBox(({ yellowBright, whiteBright, greenBright, redBright }) => {
        let colorValue = whiteBright;

        if (label === 'ENV') {
            colorValue = value === 'DEV' ? redBright : greenBright;
        }

        return `${yellowBright(label.padEnd(maxLabelLength))} ${colorValue(value)}`
    });
}
logger.bottomBorderBox();

console.log();

await client.start();
