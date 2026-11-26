const AppError = require("../utils/AppError");

function sequelizeToAppError(err) {
  switch (err.name) {
    case "SequelizeUniqueConstraintError": {
      // e.g. email already registered
      const first = err.errors && err.errors[0];
      const message = first?.message ?? "A unique field already exists";
      return new AppError(message, 409);
    }

    case "SequelizeValidationError": {
      // model-level validation (notEmpty, isEmail, len, ...)
      const details = (err.errors ?? []).map((e) => ({
        fields: e.path,
        message: e.message,
        in: "body",
      }));
      return new AppError("Validation failed", 400, details);
    }

    case "SequelizeForeignKeyConstraintError":
      return new AppError(
        "This resource is linked to other records and cannot be removed",
        409,
      );

    case "SequelizeDatabaseError":
      return new AppError("Invalid request", 400);

    default:
      return null;
  }
}

function errorHandler(err, req, res, _next) {
  let error = err;

  if (typeof err.name === "string" && err.name.startsWith("Sequelize")) {
    error = sequelizeToAppError(err) ?? err;
  }

  if (err.type === "entity.parse.failed") {
    error = new AppError("Request body is not valid JSON", 400);
  }

  const statusCode = error.statusCode || 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message:
      isServerError && process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message,
    ...(error.details && { errors: error.details }),
    ...(process.env.NODE_ENV === "development" &&
      isServerError && { stack: err.stack }),
  });
}

module.exports = errorHandler;
