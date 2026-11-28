const Joi = require("joi");

const email = Joi.string().trim().lowercase().max(254).required();

module.exports = {
  login: {
    body: Joi.object({
      email,
      password: Joi.string().required(),
    }),
  },
};