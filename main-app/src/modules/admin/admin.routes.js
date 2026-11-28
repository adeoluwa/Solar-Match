const { Router } = require("express");
const controller = require("./admin.controller");
const schemas = require("./admin.validation");
const validate = require("../../shared/middlewares/validate");

const router = Router();

router.post("/login", validate(schemas.login), controller.login);

module.exports = router;