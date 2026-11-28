const bcrypt = require("bcryptjs");
const adminRepository = require("./admin.repository");
const selects = require("./admin.selects");
const AppError = require("../../shared/utils/AppError");
const { signAccessToken } = require("../../shared/utils/tokens");

const SALT_ROUNDS = 12;

// Compared against even when the user doesn't exist, so login takes the same
// time whether or not the email is registered (no user-enumeration via timing).
const DUMMY_HASH = bcrypt.hashSync("timing-safe-placeholder", SALT_ROUNDS);

async function login({ email, password }) {
  const admin = await adminRepository.findOne({
    where: { email },
    attributes: selects.loginAdmin,
  });

  const isValidCredentials = await bcrypt.compare(
    password,
    admin?.password ?? DUMMY_HASH,
  );

  if (!admin || !isValidCredentials)
    throw new AppError("Invalid credentials", 401);

  // The password matched, so it is safe to say this login is for admins only
  if (admin.role !== "admin") {
    throw new AppError(
      "This login is for admin accounts only. Please use the customer or installer login.",
      403,
    );
  }

  const { password: _omit, ...safeAdmin } = admin;

  return { token: signAccessToken(safeAdmin), user: safeAdmin };
}

module.exports = { login };