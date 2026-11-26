class AppError extends Error {
  constructor(message, statusCode = 400, details ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // a known error, safe to show the client
  }
}

module.exports = AppError;