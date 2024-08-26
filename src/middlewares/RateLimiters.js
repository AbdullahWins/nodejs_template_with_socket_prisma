const rateLimit = require("express-rate-limit");
const { sendResponse } = require("../services/responseHandlers/HandleResponse");

// Constants
const MAX_LOGIN_ATTEMPTS = 50;
const MAX_REGISTRATION_ATTEMPTS = 50;
const WINDOW_TIME_FOR_LOGIN = 1 * 60 * 1000; // 1 minutes
const WINDOW_TIME_FOR_REGISTRATION = 60 * 60 * 1000; // 1 hour

// Function to create rate limiting middleware for login requests
const createLoginRateLimiter = () => {
  return rateLimit({
    windowMs: WINDOW_TIME_FOR_LOGIN,
    max: MAX_LOGIN_ATTEMPTS,
    handler: (req, res, next) => {
      const now = Date.now();
      const resetTime = req.rateLimit.resetTime;
      const retryAfterSeconds = Math.ceil((resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      return sendResponse(
        res,
        429,
        `Too many login attempts, please try again later in ${retryAfterSeconds} seconds`
      );
    },
  });
};

// Function to create rate limiting middleware for registration requests
const createRegisterRateLimiter = () => {
  return rateLimit({
    windowMs: WINDOW_TIME_FOR_REGISTRATION,
    max: MAX_REGISTRATION_ATTEMPTS,
    handler: (req, res, next) => {
      const retryAfterSeconds = Math.ceil(
        (req.rateLimit.resetTime - Date.now()) / 1000
      );
      const retryAfterMessage =
        retryAfterSeconds > 0 ? ` in ${retryAfterSeconds} seconds` : "";
      res.setHeader("Retry-After", retryAfterSeconds);
      return sendResponse(
        res,
        429,
        `Too many login attempts, please try again later in ${retryAfterSeconds} seconds`
      );
    },
  });
};

// Create the rate limiter middleware
const loginRateLimiter = createLoginRateLimiter();
const registerRateLimiter = createRegisterRateLimiter();

module.exports = { loginRateLimiter, registerRateLimiter };
