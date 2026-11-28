const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3 } = require("../config/filebase");
const AppError = require("../utils/AppError");

// How long a minted presigned GET URL stays valid. The URL is generated on
// demand when a document is shown to the installer or an admin — never stored.
const PRESIGNED_URL_TTL_SECONDS = 15 * 60; // 15 minutes

function bucket() {
  const name = process.env.FILEBASE_BUCKET;
  if (!name) {
    // Misconfiguration, not a client error -> 500.
    throw new AppError("FILEBASE_BUCKET is not configured", 500);
  }
  return name;
}

/**
 * Upload a document to the Filebase bucket.
 * @param {object} args
 * @param {string} args.key          Object key, e.g. "installers/12/government_id-<uuid>.pdf"
 * @param {Buffer} args.body         File bytes (from multer memory storage)
 * @param {string} [args.contentType]
 * @returns {Promise<string>} the stored object key (persist this, not the file)
 */
async function uploadDocument({ key, body, contentType = "application/pdf" }) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return key;
}

/** Permanently remove an object from the bucket. */
async function deleteDocument(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

/**
 * Mint a short-lived presigned GET URL for an object. Generate this on read and
 * hand it to the client; do not store it (it expires).
 */
function getPresignedUrl(key, expiresIn = PRESIGNED_URL_TTL_SECONDS) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket(), Key: key }),
    {
      expiresIn,
    },
  );
}

module.exports = {
  uploadDocument,
  deleteDocument,
  getPresignedUrl,
  PRESIGNED_URL_TTL_SECONDS,
};
