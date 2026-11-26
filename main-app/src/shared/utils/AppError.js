class AppError extends Error {
  constructor(message, statusCode = 400, details ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // a know error, safe to show the client
  }
}

module.exports = AppError;