const { Router } = require("express");
const controller = require("./users.controller");
const schemas = require("./users.validation");
const validate = require("../../shared/middlewares/validate");

const router = Router();

router.post("/register", validate(schemas.register), controller.register);

router.post("/login", validate(schemas.login), controller.login);

router.post(
  "/forgot-password",
  validate(schemas.forgotPassword),
  controller.forgotPassword,
);

router.post(
  "/reset-password",
  validate(schemas.resetPassword),
  controller.resetPassword,
);

module.exports = router;
