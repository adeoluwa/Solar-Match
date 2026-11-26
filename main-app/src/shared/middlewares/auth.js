const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

function authenticate(req,res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';

    next(new AppError(message, 401));
  }
}

function authorizeSelf(paramName = 'userId') {
  return (req, res, next) => {
    if (Number(req.params[paramName]) !== req.user.id) {
      return next(new AppError('You can only access your own data', 403));
    }
    next();
  }
}

// Role gate, e.g. authorizeRoles('admin') on admin-only routes.
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}

module.exports = { authenticate, authorizeSelf, authorizeRoles };

