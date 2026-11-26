const { UnrecoverableError } = require('bullmq');
const { processEmailJob } = require('./email.processor');

process.env.EMAIL_SERVICE_URL = 'http://email.test/api/v1';
process.env.INTERNAL_API_KEY = 'test-key';

const job = {
  id: 'a1b2c3',
  data: { type: 'welcome', to: 'ada@example.com', data: { name: 'Ada' } },
};

const mockResponse = (status, body = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

beforeEach(() => {
  global.fetch = jest.fn();
});

describe('processEmailJob', () => {
  it('sends the job to the email service with the API key and jobId', async () => {
    fetch.mockResolvedValue(mockResponse(200, { data: { id: 7, status: 'sent' } }));

    const result = await processEmailJob(job);

    expect(result).toEqual({ emailLogId: 7, status: 'sent' });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('http://email.test/api/v1/email/send');
    expect(options.headers['x-api-key']).toBe('test-key');
    expect(JSON.parse(options.body)).toEqual({ ...job.data, jobId: 'a1b2c3' });
  });

  it('throws a retryable error when the email service returns 502', async () => {
    fetch.mockResolvedValue(mockResponse(502, { message: 'Resend failed' }));

    const err = await processEmailJob(job).catch((e) => e);

    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(UnrecoverableError);
  });

  it('throws a retryable error when the email service is unreachable', async () => {
    fetch.mockRejectedValue(new Error('ECONNREFUSED'));

    const err = await processEmailJob(job).catch((e) => e);

    expect(err.message).toMatch(/unreachable/);
    expect(err).not.toBeInstanceOf(UnrecoverableError);
  });

  it('fails permanently on 400 (bad data)', async () => {
    fetch.mockResolvedValue(mockResponse(400, { message: 'Validation failed' }));

    await expect(processEmailJob(job)).rejects.toBeInstanceOf(UnrecoverableError);
  });

  it('retries on 401 (wrong API key) — a config error fixed by redeploy, not by the job', async () => {
    fetch.mockResolvedValue(mockResponse(401, { message: 'Invalid API key' }));

    const err = await processEmailJob(job).catch((e) => e);

    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(UnrecoverableError);
  });
});