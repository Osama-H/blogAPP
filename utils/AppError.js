class AppError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

// const createAppError = (msg, code) => {
//   return new AppError(msg, code);
// };

module.exports = AppError;
