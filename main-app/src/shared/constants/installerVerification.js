// Single source of truth for installer-verification enums. Imported by the
// Sequelize models (so the ENUM columns stay in sync) and by the installers /
// admin modules (validation, service rules). Keep this file dependency-free.

// Every document type an installer can upload, per the PM's verification spec.
const DOCUMENT_TYPES = [
  "government_id", // Government-issued ID of the installer / representative
  "proof_of_address", // Proof of business or operating address
  "training_certificate", // Solar installation training / qualification certificate
  "previous_projects", // Evidence of previous installation projects
  "cac_certificate", // CAC registration — required for registered businesses
  "tin", // Optional: Tax Identification Number evidence
  "professional_membership", // Optional: professional membership certificate
  "manufacturer_authorisation", // Optional: manufacturer authorisation
  "customer_reference", // Optional: customer reference
];

// The four core uploads every installer must provide to submit for review.
const MANDATORY_DOCUMENT_TYPES = [
  "government_id",
  "proof_of_address",
  "training_certificate",
  "previous_projects",
];

// Conditional: required only when the installer applies as a registered business.
const CONDITIONAL_DOCUMENT_TYPE = "cac_certificate";

// Verification lifecycle for an installer's business profile.
//   pending   -> profile created, not yet submitted (installer can still edit/upload)
//   inReview  -> submitted; awaiting manual admin review
//   verified  -> approved; installer earns the verified badge
//   rejected  -> declined with a reason; installer can fix and resubmit
const VERIFICATION_STATUS = {
  PENDING: "pending",
  IN_REVIEW: "inReview",
  VERIFIED: "verified",
  REJECTED: "rejected",
};

const VERIFICATION_STATUSES = Object.values(VERIFICATION_STATUS);

// Only PDFs are accepted for now.
const ALLOWED_MIME_TYPES = ["application/pdf"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

module.exports = {
  DOCUMENT_TYPES,
  MANDATORY_DOCUMENT_TYPES,
  CONDITIONAL_DOCUMENT_TYPE,
  VERIFICATION_STATUS,
  VERIFICATION_STATUSES,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
};
