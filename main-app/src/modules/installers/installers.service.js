const crypto = require("crypto");
const repo = require("./installers.repository");
const selects = require("./installers.selects");
const AppError = require("../../shared/utils/AppError");
const storage = require("../../shared/integrations/filebase");
const {
  VERIFICATION_STATUS,
  MANDATORY_DOCUMENT_TYPES,
  CONDITIONAL_DOCUMENT_TYPE,
} = require("../../shared/constants/installerVerification");

// An installer may still edit while pending or rejected — not once submitted.
function assertEditable(profile) {
  if (profile.verificationStatus === VERIFICATION_STATUS.IN_REVIEW) {
    throw new AppError(
      "Your submission is under review and can no longer be changed",
      409,
    );
  }
  if (profile.verificationStatus === VERIFICATION_STATUS.VERIFIED) {
    throw new AppError("Your business is already verified", 409);
  }
}

async function getProfileByUserId(userId, attributes = selects.profileStatus) {
  const profile = await repo.profiles.findOne({
    where: { userId },
    attributes,
  });
  if (!profile) {
    throw new AppError("No installer profile found. Create one first.", 404);
  }
  return profile;
}

// Attach a freshly minted presigned GET URL to each document row.
async function withPresignedUrls(documents) {
  return Promise.all(
    documents.map(async (doc) => ({
      ...doc,
      url: await storage.getPresignedUrl(doc.storageKey),
    })),
  );
}

async function upsertProfile(userId, data) {
  const existing = await repo.profiles.findOne({
    where: { userId },
    attributes: selects.profileStatus,
  });

  if (!existing) {
    return repo.profiles.create({
      data: { ...data, userId },
      attributes: selects.profile,
    });
  }

  assertEditable(existing);

  return repo.profiles.update({
    where: { id: existing.id },
    data,
    attributes: selects.profile,
  });
}

async function getMyProfile(userId) {
  const profile = await getProfileByUserId(userId, selects.profile);

  const documents = await repo.documents.findMany({
    where: { installerProfileId: profile.id },
    attributes: selects.document,
    order: [["createdAt", "ASC"]],
  });

  return { ...profile, documents: await withPresignedUrls(documents) };
}

// Upload one or more documents in a single call. `items` is an array of
// { documentType, file } — one entry per uploaded file. Each type keeps a
// single document, so re-uploading a type replaces the previous file.
async function uploadDocuments(userId, items) {
  const profile = await getProfileByUserId(userId);
  assertEditable(profile);

  // Push every file to storage first (in parallel), so a DB write never points
  // at an object that failed to upload.
  const uploaded = await Promise.all(
    items.map(async ({ documentType, file }) => {
      const key = `installers/${profile.id}/${documentType}-${crypto.randomUUID()}.pdf`;
      await storage.uploadDocument({
        key,
        body: file.buffer,
        contentType: file.mimetype,
      });
      return { documentType, key, file };
    }),
  );

  // Upsert a row per type; collect any replaced object keys to clean up after.
  const saved = [];
  const staleKeys = [];

  for (const { documentType, key, file } of uploaded) {
    const previous = await repo.documents.findOne({
      where: { installerProfileId: profile.id, documentType },
      attributes: selects.documentStorage,
    });

    const data = {
      installerProfileId: profile.id,
      documentType,
      storageKey: key,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    if (previous) {
      saved.push(
        await repo.documents.update({
          where: { id: previous.id },
          data,
          attributes: selects.document,
        }),
      );
      staleKeys.push(previous.storageKey);
    } else {
      saved.push(
        await repo.documents.create({ data, attributes: selects.document }),
      );
    }
  }

  // Best-effort cleanup of replaced objects; the DB already points at the new ones.
  staleKeys.forEach((staleKey) =>
    storage
      .deleteDocument(staleKey)
      .catch((err) =>
        console.error("[filebase] failed to delete replaced object", err),
      ),
  );

  return withPresignedUrls(saved);
}

async function deleteDocument(userId, documentId) {
  const profile = await getProfileByUserId(userId);
  assertEditable(profile);

  const doc = await repo.documents.findOne({
    where: { id: documentId, installerProfileId: profile.id },
    attributes: selects.documentStorage,
  });
  if (!doc) throw new AppError("Document not found", 404);

  await repo.documents.delete({ where: { id: doc.id } });

  storage
    .deleteDocument(doc.storageKey)
    .catch((err) => console.error("[filebase] failed to delete object", err));
}

async function submitForReview(userId) {
  const profile = await getProfileByUserId(userId);
  assertEditable(profile);

  const documents = await repo.documents.findMany({
    where: { installerProfileId: profile.id },
    attributes: ["documentType"],
  });
  const uploadedTypes = new Set(documents.map((d) => d.documentType));

  // Four core uploads are always required; CAC is required for registered businesses.
  const required = [...MANDATORY_DOCUMENT_TYPES];
  if (profile.isRegisteredBusiness) required.push(CONDITIONAL_DOCUMENT_TYPE);

  const missing = required.filter((type) => !uploadedTypes.has(type));
  if (missing.length) {
    throw new AppError(
      "Upload all required documents before submitting",
      400,
      missing.map((type) => ({
        fields: type,
        message: `${type} is required`,
        in: "documents",
      })),
    );
  }

  return repo.profiles.update({
    where: { id: profile.id },
    data: {
      verificationStatus: VERIFICATION_STATUS.IN_REVIEW,
      submittedAt: new Date(),
      rejectionReason: null, // clear any prior rejection on resubmit
      reviewedBy: null,
      reviewedAt: null,
    },
    attributes: selects.profile,
  });
}

module.exports = {
  upsertProfile,
  getMyProfile,
  uploadDocuments,
  deleteDocument,
  submitForReview,
  withPresignedUrls, // reused by the admin review flow
};
