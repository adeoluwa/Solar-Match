const request = require("supertest");

jest.mock("../../shared/config/resend", () => ({
  emails: { send: jest.fn() },
}));

jest.mock("./email.repository", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
}));

process.env.INTERNAL_API_KEY = "test-key";
process.env.EMAIL_FROM = "Test <test@example.com>";

const resend = require("../../shared/config/resend");
const repo = require("./email.repository");
const app = require("../../app");

const URL = "/api/v1/email/send";
const welcome = {
  type: "welcome",
  to: "ada@example.com",
  jobId: "1",
  data: { name: "Ada" },
};

describe("POST /api/v1/email/send", () => {
  it("rejects requests without an API Key", async () => {
    const res = await request(app).post(URL).send(welcome);

    expect(res.status).toBe(401);

    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it("rejects an unknown email type", async () => {
    const res = await request(app)
      .post(URL)
      .set("x-api-key", "test-key")
      .send({ ...welcome, type: "newsletter" });
    expect(res.status).toBe(400);
  });

  it("rejects data that does not match the type", async () => {
    const res = await request(app)
      .post(URL)
      .set("x-api-key", "test-key")
      .send({ ...welcome, type: "password_reset" }); // missing resetUrl
    expect(res.status).toBe(400);
  });

  it("sends the email and logs it", async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: 1 });
    resend.emails.send.mockResolvedValue({
      data: { id: "re_123" },
      error: null,
    });
    repo.update.mockResolvedValue({
      id: 1,
      status: "sent",
      providerId: "re_123",
    });

    const res = await request(app)
      .post(URL)
      .set("x-api-key", "test-key")
      .send(welcome);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("sent");
    expect(resend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: "ada@example.com", subject: "Welcome!" }),
      { idempotencyKey: "welcome/1" },
    );
  });

  it("does not resend a job that already succeeded", async () => {
    repo.findOne
      .mockResolvedValueOnce({ id: 1, status: "sent" })
      .mockResolvedValueOnce({ id: 1, status: "sent", jobId: "1" });

    const res = await request(app)
      .post(URL)
      .set("x-api-key", "test-key")
      .send(welcome);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/already sent/);
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it("returns 422 and marks the log failed on a permanent Resend error", async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: 2 });
    resend.emails.send.mockResolvedValue({
      data: null,
      error: {
        name: "invalid_from_address",
        message: "Invalid from address",
        statusCode: 422,
      },
    });
    repo.update.mockResolvedValue({ id: 2 });

    const res = await request(app)
      .post(URL)
      .set("x-api-key", "test-key")
      .send(welcome);

    expect(res.status).toBe(422);
    expect(repo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "failed" }),
      }),
    );
  });

  it("returns 502 and marks the log failed on a transient Resend error", async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: 3 });
    resend.emails.send.mockResolvedValue({
      data: null,
      error: {
        name: "internal_server_error",
        message: "Something went wrong",
        statusCode: 500,
      },
    });
    repo.update.mockResolvedValue({ id: 3 });

    const res = await request(app)
      .post(URL)
      .set("x-api-key", "test-key")
      .send(welcome);

    expect(res.status).toBe(502);
    expect(repo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "failed" }),
      }),
    );
  });

  it("returns 502 when the send throws (network/timeout)", async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: 4 });
    resend.emails.send.mockRejectedValue(new Error("socket hang up"));
    repo.update.mockResolvedValue({ id: 4 });

    const res = await request(app)
      .post(URL)
      .set("x-api-key", "test-key")
      .send(welcome);

    expect(res.status).toBe(502);
  });
});
