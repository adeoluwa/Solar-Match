const { Router } = require("express");
const controller = require("./admin.controller");
const schemas = require("./admin.validation");
const validate = require("../../shared/middlewares/validate");
const {
  authenticate,
  authorizeRoles,
} = require("../../shared/middlewares/auth");

const router = Router();

router.post("/login", validate(schemas.login), controller.login);

// Everything below requires an authenticated admin.
router.use(authenticate, authorizeRoles("admin"));

router.get(
  "/installers",
  validate(schemas.listInstallers),
  controller.listInstallers,
);

router.get(
  "/installers/:id",
  validate(schemas.installerIdParam),
  controller.getInstaller,
);

router.patch(
  "/installers/:id/review",
  validate(schemas.reviewInstaller),
  controller.reviewInstaller,
);

module.exports = router;
