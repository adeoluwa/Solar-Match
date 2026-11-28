const Joi = require("joi");
const {
  VERIFICATION_STATUSES,
  VERIFICATION_STATUS,
} = require("../../shared/constants/installerVerification");

const email = Joi.string().trim().lowercase().max(254).required();

const REVIEW_DECISIONS = [
  VERIFICATION_STATUS.VERIFIED,
  VERIFICATION_STATUS.REJECTED,
];

module.exports = {
  login: {
    body: Joi.object({
      email,
      password: Joi.string().required(),
    }),
  },

  // GET /admin/installers?status=inReview
  listInstallers: {
    query: Joi.object({
      status: Joi.string()
        .valid(...VERIFICATION_STATUSES)
        .messages({
          "any.only": `status must be one of: ${VERIFICATION_STATUSES.join(", ")}`,
        }),
    }),
  },

  installerIdParam: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },

  // PATCH /admin/installers/:id/review
  reviewInstaller: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      decision: Joi.string()
        .valid(...REVIEW_DECISIONS)
        .required()
        .messages({ "any.only": "decision must be verified or rejected" }),
      // A reason is required to reject and ignored for approvals.
      rejectionReason: Joi.when("decision", {
        is: VERIFICATION_STATUS.REJECTED,
        then: Joi.string().trim().min(5).max(1000).required().messages({
          "any.required": "rejectionReason is required when rejecting",
          "string.min": "rejectionReason must be at least 5 characters",
        }),
        otherwise: Joi.forbidden(),
      }),
    }),
  },
};
