const { UnrecoverableError } = require("bullmq");

// 4xx codes that can succeed if tried again later. 401/403 are auth/config
// failures (e.g. a wrong INTERNAL_API_KEY at deploy): fixed by redeploying with
// the right key, not by changing the job, so retry rather than fail for good.
const RETRYABLE_4XX = new Set([401, 403, 408, 409, 429]);

async function sendEmail(payload) {
  let res;

  try {
    res = await fetch(`${process.env.EMAIL_SERVICE_URL}/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.INTERNAL_API_KEY,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    // Email service down, timed out, DNS failure: retry later
    throw new Error(`Email service unreachable: ${error.message}`);
  }

  const body = await res.json().catch(() => ({}));

  if (res.ok) return body;

  const message = `Email service responded ${res.status}: ${body.message ?? "no message"}`;

  // 5xx (including 502 from Resend failures) and a few 4xx: retry
  if (res.status >= 500 || RETRYABLE_4XX.has(res.status))
    throw new Error(message);

  // 400 bad data, 401 wrong API key, etc.: retrying won't help, fail immediately

  throw new UnrecoverableError(message);
}

module.exports = { sendEmail }; 