const { Sequelize } = require("sequelize");

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and set your Postgres connection string.",
  );
}

// Many hosted Postgres providers (Neon, Supabase, Render, Railway) require SSL.
// Flip DATABASE_SSL=true in that case.
const dialectOptions =
  process.env.DATABASE_SSL === "true"
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {};

const sequelize = new Sequelize(url, {
  dialect: "postgres",
  dialectOptions,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
});

module.exports = sequelize;
