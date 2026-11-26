const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

function createResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex"); // goes in the email
  return {
    rawToken,
    hashedToken: hashToken(rawToken), // goes in the database
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  };
}

function signAccessToken({ id, email, role }) {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

module.exports = { hashToken, createResetToken, signAccessToken };
