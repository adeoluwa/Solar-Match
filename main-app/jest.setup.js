// Loaded before the test files (see jest.config.js). Gives the Sequelize
// instance a dialect-valid URL so requiring the models never throws; the two
// smoke tests don't hit the database, so no real connection is opened.
process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/testdb";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
