const { Router } = require("express");
const controller = require("./installers.controller");
const schemas = require("./installers.validation");
const validate = require("../../shared/middlewares/validate");
const { uploadDocumentFields } = require("./installers.upload");
const {
  authenticate,
  authorizeRoles,
} = require("../../shared/middlewares/auth");

const router = Router();

// Every installer route requires an authenticated installer.
router.use(authenticate, authorizeRoles("installer"));

router
  .route("/profile")
  .get(controller.getMyProfile)
  .post(validate(schemas.upsertProfile), controller.upsertProfile);

// Upload one or more documents in a single multipart request — one field per
// document type. The field names carry the type, so no body validation is needed.
router.post("/documents", uploadDocumentFields, controller.uploadDocuments);

router.delete(
  "/documents/:documentId",
  validate(schemas.documentIdParam),
  controller.deleteDocument,
);

router.post("/submit", controller.submitForReview);

module.exports = router;
