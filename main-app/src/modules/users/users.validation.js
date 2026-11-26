const Joi = require("joi");

// Roles a user can self-register / log in as. `admin` is seeded, never public.
const ROLES = ["customer", "installer"];

const email = Joi.string().trim().lowercase().email().max(254).required();

const password = Joi.string().min(8).max(72).required().messages({
  "string.min": "password must be at least 8 characters",
});

const confirmPassword = Joi.any()
  .valid(Joi.ref("password"))
  .required()
  .messages({
    "any.only": "confirmPassword must match password",
    "any.required": "confirmPassword is required",
  });

const role = Joi.string()
  .valid(...ROLES)
  .required()
  .messages({ "any.only": "role must be customer or installer" });

// Single field from the register screen, e.g. "Lagos / Ikeja" (State / LGA)
const location = Joi.string()
  .trim()
  .pattern(/^[^/]+\/[^/]+$/)
  .required()
  .messages({
    "string.pattern.base":
      "location must be in the format State / LGA (e.g. Lagos / Ikeja)",
  });

const phone = Joi.string()
  .trim()
  .pattern(/^(?:\+?234|0)\d{10}$/)
  .required()
  .messages({
    "string.pattern.base":
      "phone must be a valid Nigerian number (e.g. 08012345678)",
  });

module.exports = {
  ROLES,

  register: {
    body: Joi.object({
      fullName: Joi.string().trim().min(2).max(100).required(),
      email,
      phone,
      location,
      password,
      confirmPassword,
      role,
    }),
  },

  login: {
    body: Joi.object({
      email,
      password: Joi.string().required(),
      role,
    }),
  },

  forgotPassword: {
    body: Joi.object({ email }),
  },

  resetPassword: {
    body: Joi.object({
      token: Joi.string().hex().length(64).required(),
      password,
      confirmPassword,
    }),
  },
};
