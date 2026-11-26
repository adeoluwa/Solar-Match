const crypto = require('crypto');
const AppError = require('../utils/AppError');

function apiKey(req, res, next) {
  const expected = process.env.INTERNAL_API_KEY;
  const provided = req.get('x-api-key');

  if (!expected) return next(new AppError('INTERNAL_API_KEY is not configured', 500));
  if (!provided) return next(new AppError('API key required', 401));

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  // timingSafeEqual: comparison takes the same time whether 1 or 30 characters match
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return next(new AppError('Invalid API key', 401));
  }

  next();
}

module.exports = apiKey;