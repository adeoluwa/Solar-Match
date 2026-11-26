const Joi = require("joi");

const EMAIL_TYPES = ["welcome", "password_reset", "order_confirmation"];

const welcomeData = Joi.object({
  name: Joi.string().trim().required(),
});

const passwordResetData = Joi.object({
  name: Joi.string().trim().required(),
  resetUrl: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .required(),
});

const orderConfirmationData = Joi.object({
  name: Joi.string().trim().required(),
  orderId: Joi.number().integer().positive().required(),
  total: Joi.number().integer().min(0).required(), // kobo
  items: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().integer().positive().required(),
        price: Joi.number().integer().min(0).required(), // kobo
      }),
    )
    .min(1)
    .required(),
});

module.exports = {
  EMAIL_TYPES,
  send: {
    body: Joi.object({
      type: Joi.string()
        .valid(...EMAIL_TYPES)
        .required(),
      to: Joi.string().trim().lowercase().email().required(),
      jobId: Joi.string().max(100), // optional: sent by the worker for idempotency
      data: Joi.alternatives()
        .conditional("type", {
          switch: [
            { is: "welcome", then: welcomeData },
            { is: "password_reset", then: passwordResetData },
            { is: "order_confirmation", then: orderConfirmationData },
          ],
        })
        .required(),
    }),
  },
};
