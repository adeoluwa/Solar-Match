const IORedis = require('ioredis');

const connection  = new IORedis(process.env.REDIS_URL, {
  // Producer side: fail fast when Redis is down instead of hanging the HTTP request
  enableOfflineQueue: false
});

connection.on('connect', () => console.log('[redis] connected'));
connection.on('error', (err) => console.error('[redis] error:', err.message));

module.exports = connection;