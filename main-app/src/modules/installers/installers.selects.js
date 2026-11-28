// Sequelize `attributes` lists for installer queries.
module.exports = {
  idOnly: ["id"],

  // Returned to the installer (and reused by admin) for a business profile.
  profile: [
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
    "reviewedAt",
    "createdAt",
    "updatedAt",
  ],

  // Enough to run the status/ownership checks without loading everything.
  profileStatus: ["id", "userId", "verificationStatus", "isRegisteredBusiness"],

  // A document row as returned to the client (plus a minted presigned URL added
  // by the service — the URL itself is never stored).
  document: [
    "id",
    "installerProfileId",
    "documentType",
    "storageKey",
    "fileName",
    "fileSize",
    "mimeType",
    "createdAt",
  ],

  // Just the storage pointer, e.g. when deleting/replacing an object.
  documentStorage: ["id", "storageKey"],
};
