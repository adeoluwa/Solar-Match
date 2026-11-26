const AppError = require("../utils/AppError");

const options = { abortEarly: false, stripUnknown: true, convert: true };

function validate(schemas) {
  return (req, _res, next) => {
    const errors = [];

    for (const source of ['params', 'query', 'body']) {
      if (!schemas[source]) continue;

      const { error, value } = schemas[source].validate(req[source] ?? {}, options);

      if (error) {
        errors.push(
          ...error.details.map((detail) => ({
            fields: detail.path.join('.'),
            message: detail.message.replace(/"/g, ''),
            in: source
          }))
        );

        continue;
      }

      // Express 5 makes req.query read-only, so it's redefined instead of reassigned

      if ( source === 'query') {
        Object.defineProperty(req, 'query', { value, writable: true, configurable: true });

      } else {
        req[source] = value;
      }
    }

    if (errors.length) {
      return next(new AppError('Validation failed', 400, errors));
    }

    next();
  };
}

module.exports = validate;