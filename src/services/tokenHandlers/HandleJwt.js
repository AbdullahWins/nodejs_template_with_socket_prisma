const jwt = require("jsonwebtoken");
const { logger } = require("../logHandlers/HandleWinston");
const { CustomError } = require("../responseHandlers/HandleResponse");

const jwtSecret = process.env.JWT_SECRET_KEY;
const expiresIn = process.env.JWT_EXPIRES_IN;

const generateToken = (payload) => {
  try {
    const token = jwt.sign({ _id: payload }, jwtSecret, {
      expiresIn: expiresIn,
    });
    logger.log("info", "Token generated successfully");
    return token;
  } catch (error) {
    logger.log("error", `Error generating JWT token: ${error?.message}`);
    throw new CustomError(500, "Error generating token");
  }
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    logger.log("info", "Token decoded successfully");
    return decoded;
  } catch (error) {
    logger.log("error", `Error verifying JWT token: ${error?.message}`);
    throw new CustomError(401, "Invalid token");
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
