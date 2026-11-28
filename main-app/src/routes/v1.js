const { Router } = require("express");

const router = Router();

router.use("/users", require("../modules/users/users.routes"));
router.use("/admin", require("../modules/admin/admin.routes"));

module.exports = router;
