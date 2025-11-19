import logger from '@/utils/logger.js'

export const jobsLogger = logger.use({
    prefix: (c) => c.white(`[${c.cyanBright(`JOBS`)}] <🕛>`)
});

export const startAllJobs = async () => {
    logger.log(`⏳ » Starting all jobs..`);
    await import('./voiceTracking.js');
    logger.log(`✅ » All jobs started successfully`);
}

export default {
    startAllJobs,
    logger
}
