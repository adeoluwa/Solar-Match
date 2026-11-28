const installersService = require("./installers.service");
const AppError = require("../../shared/utils/AppError");

async function upsertProfile(req, res) {
  const profile = await installersService.upsertProfile(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: "Business profile saved",
    data: profile,
  });
}

async function getMyProfile(req, res) {
  const profile = await installersService.getMyProfile(req.user.id);

  res.status(200).json({ success: true, data: profile });
}

async function uploadDocuments(req, res) {
  // multer .fields() gives { <documentType>: [file], ... }. Flatten to a list
  // of { documentType, file } entries.
  const filesByType = req.files || {};
  const items = Object.entries(filesByType).flatMap(([documentType, files]) =>
    files.map((file) => ({ documentType, file })),
  );

  if (!items.length) {
    throw new AppError(
      "Upload at least one PDF, each under a field named by its document type",
      400,
    );
  }

  const documents = await installersService.uploadDocuments(req.user.id, items);

  res.status(201).json({
    success: true,
    message: `${documents.length} document(s) uploaded`,
    data: documents,
  });
}

async function deleteDocument(req, res) {
  await installersService.deleteDocument(req.user.id, req.params.documentId);

  res.status(200).json({ success: true, message: "Document removed" });
}

async function submitForReview(req, res) {
  const profile = await installersService.submitForReview(req.user.id);

  res.status(200).json({
    success: true,
    message: "Submitted for review. You'll be notified once it's reviewed.",
    data: profile,
  });
}

module.exports = {
  upsertProfile,
  getMyProfile,
  uploadDocuments,
  deleteDocument,
  submitForReview,
};
