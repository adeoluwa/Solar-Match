require("dotenv").config();

const app = require("./app");
const sequelize = require("./shared/config/db");
const redis = require("./shared/config/redis");
const { emailQueue } = require("./shared/queue/emailQueue");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("[db] connected");
  } catch (err) {
    console.error("[db] unable to connect:", err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () =>
    console.log(`Main app running on port ${PORT}`),
  );

  async function shutdown(signal) {
    console.log(`${signal} received, shutting down`);
    server.close();

    await emailQueue.close();
    await redis.quit();
    await sequelize.close();

    process.exit(0);
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl+C locally
}

start();
