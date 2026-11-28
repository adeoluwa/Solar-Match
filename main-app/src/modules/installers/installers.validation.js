const Joi = require("joi");

const businessPhone = Joi.string()
  .trim()
  .pattern(/^(?:\+?234|0)\d{10}$/)
  .messages({
    "string.pattern.base":
      "businessPhone must be a valid Nigerian number (e.g. 08012345678)",
  });

module.exports = {
  // POST /installers/profile — create or replace the business profile.
  upsertProfile: {
    body: Joi.object({
      businessName: Joi.string().trim().min(2).max(150).required(),
      businessEmail: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(254)
        .required(),
      contactPersonName: Joi.string().trim().min(2).max(100).required(),
      businessPhone: businessPhone.required(),
      isRegisteredBusiness: Joi.boolean().default(false),

      // Optional fields
      businessAddress: Joi.string().trim().max(255).allow("", null),
      serviceState: Joi.string().trim().max(100).allow("", null),
      serviceLga: Joi.string().trim().max(100).allow("", null),
      businessDescription: Joi.string().trim().max(2000).allow("", null),
    }),
  },

  // POST /installers/documents takes files only (multer .fields()), one field
  // per document type — the field names carry the type, so there's nothing to
  // validate in the body here.

  documentIdParam: {
    params: Joi.object({
      documentId: Joi.number().integer().positive().required(),
    }),
  },
};
