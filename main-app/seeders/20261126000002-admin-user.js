"use strict";

const bcrypt = require("bcryptjs");

// Seeds the single admin account. Credentials come from env (set them in
// main-app/.env); the defaults are for local development only — change them.
module.exports = {
  async up(queryInterface) {
    const email = (process.env.ADMIN_EMAIL || "admin@solar.local")
      .trim()
      .toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const fullName = process.env.ADMIN_FULLNAME || "Administrator";

    // Idempotent: don't create a second admin if one already exists
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = :email LIMIT 1",
      { replacements: { email } },
    );

    if (existing.length) return;

    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date();

    await queryInterface.bulkInsert("users", [
      {
        fullName,
        email,
        password: hashedPassword,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    const email = (process.env.ADMIN_EMAIL || "admin@solar.local")
      .trim()
      .toLowerCase();
    await queryInterface.bulkDelete("users", { email });
  },
};
