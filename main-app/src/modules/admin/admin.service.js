const bcrypt = require("bcryptjs");
const adminRepository = require("./admin.repository");
const installersRepository = require("../installers/installers.repository");
const usersRepository = require("../users/users.repository");
const { withPresignedUrls } = require("../installers/installers.service");
const selects = require("./admin.selects");
const AppError = require("../../shared/utils/AppError");
const { signAccessToken } = require("../../shared/utils/tokens");
const {
  VERIFICATION_STATUS,
} = require("../../shared/constants/installerVerification");

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

// --- Installer verification review ---

async function listInstallers({ status } = {}) {
  const where = status ? { verificationStatus: status } : {};

  return installersRepository.profiles.findMany({
    where,
    attributes: selects.installerListItem,
    order: [["submittedAt", "DESC"]],
  });
}

async function getInstaller(id) {
  const profile = await installersRepository.profiles.findOne({
    where: { id },
    attributes: selects.installerDetail,
  });
  if (!profile) throw new AppError("Installer profile not found", 404);

  const [documents, applicant] = await Promise.all([
    installersRepository.documents.findMany({
      where: { installerProfileId: profile.id },
      attributes: selects.installerDocument,
      order: [["createdAt", "ASC"]],
    }),
    usersRepository.findOne({
      where: { id: profile.userId },
      attributes: selects.applicant,
    }),
  ]);

  return {
    ...profile,
    applicant,
    documents: await withPresignedUrls(documents),
  };
}

async function reviewInstaller(adminId, id, { decision, rejectionReason }) {
  const profile = await installersRepository.profiles.findOne({
    where: { id },
    attributes: ["id", "verificationStatus"],
  });
  
  if (!profile) throw new AppError("Installer profile not found", 404);

  // Only a submission that's awaiting review can be decided on.
  if (profile.verificationStatus !== VERIFICATION_STATUS.IN_REVIEW) {
    throw new AppError(
      "Only submissions that are under review can be approved or rejected",
      409,
    );
  }

  const isApproval = decision === VERIFICATION_STATUS.VERIFIED;

  return installersRepository.profiles.update({
    where: { id: profile.id },
    data: {
      verificationStatus: decision,
      rejectionReason: isApproval ? null : rejectionReason,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
    attributes: selects.installerDetail,
  });
}

module.exports = { login, listInstallers, getInstaller, reviewInstaller };
