const AppError = require("./AppError");

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "fail",
      message: err.message,
    });
  }
  res.status(500).json({
    status : "fail",
    error : err.message,
  })
};

module.exports = errorHandler;
