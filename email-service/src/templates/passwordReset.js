const esc = require('./escape');

module.exports = ({ name, resetUrl }) => ({
  subject: 'Reset your password',
  html: `
    <p>Hi ${esc(name)},</p>
    <p>We received a request to reset your password. This link expires in 15 minutes:</p>
    <p><a href="${esc(resetUrl)}">Reset password</a></p>
    <p>If you didn't request this, you can ignore this email.</p>
  `,
})