const { Router } = require('express');
const controller = require('./email.controller');
const schemas = require('./email.validation');
const validate = require('../../shared/middlewares/validate');
const apiKey = require('../../shared/middlewares/apiKey');

const router = Router();

router.post('/send', apiKey, validate(schemas.send), controller.send);

module.exports = router;

