const { Router } = require("express");

const router = Router();

router.use("/users", require("../modules/users/users.routes"));

module.exports = router;
