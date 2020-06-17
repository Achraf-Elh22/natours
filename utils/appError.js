class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? 'Fail' : 'Error';
    this.isOperational = true; // Ex: When User Left required input empty // IN GENERAL ITS THE USER FAULT

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
