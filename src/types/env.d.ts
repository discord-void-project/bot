import { NodeEnv } from './nodeEnv'

export type NodeEnv = 'DEV' | 'PROD';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PREFIX: string;
            ENV: NodeEnv;
            // CLIENT
            DEBUG?: string;
            TOKEN: string;
            // DISCORD
            CLIENT_ID: string;
            CLIENT_TOKEN?: string;
            // DATABASE
            DATABASE_URL: string;
        }
    }
}

export {};