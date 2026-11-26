const { Resend } = require('resend');

// Warn at startup so a missing key is visible early, but do NOT construct the
// client here: `new Resend(undefined)` throws immediately, which would crash
// the whole service on boot just because email isn't configured yet.
if (!process.env.RESEND_API_KEY) {
  console.warn(
    '[resend] RESEND_API_KEY is not set; email sending will fail until it is configured'
  );
}

let client = null;

// Build the client lazily, on first use. If the key is still missing at that
// point we throw a clear, intentional error instead of the opaque one the
// Resend constructor raises. The service stays up; only the send fails.
function getClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('[resend] RESEND_API_KEY is not set; cannot send email');
  }

  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }

  return client;
}

// Preserve the `resend.emails.send(...)` call shape used across the service by
// forwarding property access to the lazily-created client.
module.exports = new Proxy(
  {},
  {
    get(_target, prop) {
      const value = getClient()[prop];
      return typeof value === 'function' ? value.bind(getClient()) : value;
    },
  }
);
