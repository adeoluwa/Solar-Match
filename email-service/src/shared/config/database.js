// Config consumed by sequelize-cli (migrations/seeders) via .sequelizerc.
// The running app uses src/shared/config/db.js instead; both read DATABASE_URL.
require("dotenv").config();

const dialectOptions =
  process.env.DATABASE_SSL === "true"
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {};

const base = {
  use_env_variable: "DATABASE_URL",
  dialect: "postgres",
  dialectOptions,
};

module.exports = {
  development: base,
  test: base,
  production: base,
};
