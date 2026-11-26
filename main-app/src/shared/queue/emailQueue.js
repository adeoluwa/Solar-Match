const { Queue } = require("bullmq");
const connection = require("../config/redis");
const { randomUUID } = require('crypto');

const EMAIL_QUEUE = "email"; // the worker must use this exact name

const emailQueue = new Queue(EMAIL_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 5, // retry up to 5 times
    backoff: { type: "exponential", delay: 5000 }, // 5s, 10s, 20s, 40s
    removeOnComplete: { age: 24 * 3600, count: 1000 },
    removeOnFail: { age: 7 * 24 * 3600 }, // keep failures a week for debugging
  },
});

/**
 * Adds an email job. Never throws: if Redis is down, the user's action
 * (registrating, placing an order) still succeeds and the failure is logged.
 */
async function enqueueEmail(type, to, data) {
  try {
    const job = await emailQueue.add("send-email", { type, to, data }, {jobId: randomUUID() });
    return job.id;
  } catch (error) {
    console.error(
      `[queue] failed to enqueue ${type} email to ${to}:`,
      error.message,
    );

    return null;
  }
}

const sendWelcomeEmail = (user) =>
  enqueueEmail("welcome", user.email, { name: user.name });

const sendPasswordResetEmail = (user, resetUrl) =>
  enqueueEmail("password_reset", user.email, { name: user.name, resetUrl });

const sendOrderConfirmationEmail = (user, order) => {
  enqueueEmail("order_confirmation", user.email, {
    name: user.name,
    orderId: order.id,
    total: order.total,
    items: order.items.map((index) => ({
      name: index.product.name,
      quantity: index.quantity,
      price: index.price,
    })),
  });
};

module.exports = {
  emailQueue,
  EMAIL_QUEUE,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
};
