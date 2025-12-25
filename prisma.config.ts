import 'dotenv/config'

import path from 'path'
import { defineConfig, env } from 'prisma/config'

const DATABASE_DIR = './src/database';

export default defineConfig({
    schema: path.join(DATABASE_DIR, 'schemas'),
    migrations: {
        path: path.join(DATABASE_DIR, 'migrations'),
    },
    datasource: {
        url: env('DATABASE_URL'),
    }
});