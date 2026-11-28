const multer = require("multer");
const AppError = require("../../shared/utils/AppError");
const {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  DOCUMENT_TYPES,
} = require("../../shared/constants/installerVerification");

// Files are held in memory, then streamed straight to Filebase — nothing
// touches local disk. PDFs only, max one file per document type.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: DOCUMENT_TYPES.length },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new AppError("Only PDF uploads are allowed", 400));
    }
    cb(null, true);
  },
});

// Accept several files in one request: one field per document type, each field
// named after the type (e.g. `government_id`, `proof_of_address`). Sending a
// single document is just one field present; unknown field names are rejected.
const uploadDocumentFields = upload.fields(
  DOCUMENT_TYPES.map((name) => ({ name, maxCount: 1 })),
);

module.exports = { uploadDocumentFields };
