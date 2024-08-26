// helpers/responseHelper.js

const { logger } = require("../logHandlers/HandleWinston");

const sendResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    status,
    message,
    data,
  });
};

const sendError = (res, status, message) => {
  return res.status(status).json({
    status,
    message,
  });
};

// error handler for async functions
class CustomError extends Error {
  constructor(statusCode = 500, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

//global error handler
const globalErrorHandler = (error, req, res, next) => {
  const statusCode = error?.statusCode || 500;

  // Log the error using winston
  logger.log(
    "error",
    error?.message
    // {
    //   statusCode,
    //   message: error?.message,

    //   // Log the request method, path, and body
    //   path: req?.path,

    //   // Log the user id
    //   userId: req?.user?.id,
    // }
  );

  sendError(res, statusCode, error?.message);
};

module.exports = {
  sendResponse,
  sendError,
  CustomError,
  globalErrorHandler,
};
