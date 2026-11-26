const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const usersRepository = require("./users.repository");
const selects = require("./users.selects");
const AppError = require("../../shared/utils/AppError");
const {
  hashToken,
  createResetToken,
  signAccessToken,
} = require("../../shared/utils/tokens");
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../../shared/queue/emailQueue");

const SALT_ROUNDS = 12;

// Compared against even when the user doesn't exist, so login takes the same
// time whether or not the email is registered (no user-enumeration via timing).
const DUMMY_HASH = bcrypt.hashSync("timing-safe-placeholder", SALT_ROUNDS);

// "Lagos / Ikeja" -> { state: "Lagos", lga: "Ikeja" }. Format is enforced by Joi.
function parseLocation(location) {
  const [state, lga] = location.split("/").map((part) => part.trim());
  return { state, lga };
}

async function register({ fullName, email, phone, location, password, role }) {
  const existingAccount = await usersRepository.findOne({
    where: { email },
    attributes: selects.idOnly,
  });

  if (existingAccount) throw new AppError("Email is already registered", 409);

  const { state, lga } = parseLocation(location);
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUserAccount = await usersRepository.create({
    data: { fullName, email, phone, state, lga, password: hashedPassword, role },
    attributes: selects.publicUser,
  });

  await sendWelcomeEmail({
    email: newUserAccount.email,
    name: newUserAccount.fullName,
  });

  return newUserAccount;
}

async function login({ email, password, role }) {
  const user = await usersRepository.findOne({
    where: { email },
    attributes: selects.loginUser,
  });

  const isValidCredentials = await bcrypt.compare(
    password,
    user?.password ?? DUMMY_HASH,
  );

  if (!user || !isValidCredentials)
    throw new AppError("Invalid credentials", 401);

  // Enforce the customer/installer toggle. The password already matched, so
  // revealing the real role here leaks nothing to someone who isn't the owner.
  if (user.role !== role) {
    throw new AppError(
      `This account is registered as a ${user.role}, not a ${role}. Please switch to the ${user.role} login.`,
      403,
    );
  }

  const { password: _omit, ...safeUser } = user;

  return { token: signAccessToken(safeUser), user: safeUser };
}

async function forgotPassword({ email }) {
  const user = await usersRepository.findOne({
    where: { email },
    attributes: selects.resetRecipient,
  });

  // Respond the same whether or not the account exists (no enumeration)
  if (!user) return;

  const { rawToken, hashedToken, expiresAt } = createResetToken();

  await usersRepository.update({
    where: { id: user.id },
    data: { resetToken: hashedToken, resetTokenExpiry: expiresAt },
    attributes: selects.idOnly,
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail(
    { email: user.email, name: user.fullName },
    resetUrl,
  );
}

async function resetPassword({ token, password }) {
  const user = await usersRepository.findOne({
    where: {
      resetToken: hashToken(token),
      resetTokenExpiry: { [Op.gt]: new Date() },
    },
    attributes: selects.idOnly,
  });

  if (!user) throw new AppError("Reset link is invalid or has expired", 400);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  await usersRepository.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    }, // single-use: clear the token
    attributes: selects.idOnly,
  });
}

module.exports = { register, login, forgotPassword, resetPassword };
