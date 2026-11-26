const IORedis = require('ioredis');

// BullMQ workers require maxRetriesPerRequest: null so they keep waiting for jobs
// through Redis hiccups instead of crashing
const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

connection.on('connect', () => console.log('[redis] connected'));
connection.on('error', (err) => console.error('[redis] error:', err.message));

module.exports = connection;