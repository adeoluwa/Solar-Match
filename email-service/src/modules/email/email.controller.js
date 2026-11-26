const emailService = require('./email.service');

async function send(req, res) {
  const { log, duplicate } = await emailService.sendEmail(req.body);

  res.status(200).json({
    success: true,
    message: duplicate ? 'Email was already sent for this job' : 'Email sent',
    data: log,
  })
}

module.exports = { send }