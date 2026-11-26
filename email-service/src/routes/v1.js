const { Router } = require('express');

const router = Router();

router.use('/email', require('../modules/email/email.routes'));

module.exports = router;

