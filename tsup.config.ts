import { defineConfig } from 'tsup'

export default defineConfig({
    entry: [
        'src/**/**.ts',
        '!src/database/core/**',
        '!src/**/test.*'
    ],
    outDir: 'build',
    format: ['esm'],
    target: 'esnext',
    sourcemap: false,
    dts: false,
    clean: true,
    external: [
        '@napi-rs/canvas',
        '@prisma/client',
        'prisma',
        'discord.js',
    ],
    define: {
        'process.env.ENV': JSON.stringify('PROD'),
    }
});
