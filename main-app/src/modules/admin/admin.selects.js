// Sequelize `attributes` lists for admin queries

module.exports = {
  // login: needs the hash to compare + role to check the account is an admin
  loginAdmin: ["id", "fullName", "email", "role", "password"],

  // installer review queue — summary row per submission
  installerListItem: [
    "id",
    "userId",
    "businessName",
    "businessEmail",
    "contactPersonName",
    "businessPhone",
    "verificationStatus",
    "submittedAt",
    "createdAt",
  ],

  // full installer profile for the review screen
  installerDetail: [
    "id",
    "userId",
    "businessName",
    "businessEmail",
    "contactPersonName",
    "businessPhone",
    "isRegisteredBusiness",
    "businessAddress",
    "serviceState",
    "serviceLga",
    "businessDescription",
    "verificationStatus",
    "rejectionReason",
    "submittedAt",
    "reviewedBy",
    "reviewedAt",
    "createdAt",
  ],

  installerDocument: [
    "id",
    "installerProfileId",
    "documentType",
    "storageKey",
    "fileName",
    "fileSize",
    "mimeType",
    "createdAt",
  ],

  // applicant's user account, shown alongside the profile
  applicant: ["id", "fullName", "email", "phone", "state", "lga"],

  idOnly: ["id"],
};
