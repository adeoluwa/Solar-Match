require("dotenv").config();

// Fail fast on missing config, before connecting to anything
const REQUIRED = ["REDIS_URL", "EMAIL_SERVICE_URL", "INTERNAL_API_KEY"];
const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(
    `[worker] Missing environment variables: ${missing.join(", ")}`,
  );
  process.exit(1);
}

const { Worker } = require("bullmq");
const connection = require("./config/redis");
const { processEmailJob } = require("./processors/email.processor");

const EMAIL_QUEUE = "email"; // must match EMAIL_QUEUE in main-app

const worker = new Worker(EMAIL_QUEUE, processEmailJob, {
  connection,
  concurrency: Number(process.env.EMAIL_CONCURRENCY) || 5,
  // Stay under Resend's per-second rate limit
  limiter: {
    max: Number(process.env.EMAIL_RATE_LIMIT_PER_SEC) || 2,
    duration: 1000,
  },
});

worker.on("ready", () =>
  console.log(`[worker] listening on "${EMAIL_QUEUE}" queue`),
);

worker.on("completed", (job) => {
  console.log(
    `[worker] job ${job.id} done: ${job.data.type} -> ${job.data.to}`,
  );
});

worker.on('failed', (job, err) => {
  if (!job) return;
  
  const maxAttempts = job.opts.attempts ?? 1;
  const isFinal = err.name === 'UnrecoverableError' || job.attemptsMade >= maxAttempts;

  console.error(
    `[worker] job ${job.id} ${isFinal ? 'FAILED permanently' : 'failed, will retry'} ` +
      `(attempt ${job.attemptsMade}/${maxAttempts}): ${err.message}`
  );
});

worker.on('error', (err) => console.error('[worker] error:', err.message));

async function shutdown(signal) {
  console.error(`[worker] ${signal} received, finishing active jobs...`);
  await worker.close(); // waits for in-progress jobs to finish
  await connection.quit();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));