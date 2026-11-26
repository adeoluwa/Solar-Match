const { sendEmail } = require("../clients/emailService.client");

async function processEmailJob(job) {
  const { type, to, data } = job.data;

  const result = await sendEmail({
    type,
    to,
    data,
    jobId: String(job.id), // lets the email service skip duplicates on retry
  });

  return { emailLogId: result.data?.id, status: result.data?.status}
};

module.exports = { processEmailJob };
