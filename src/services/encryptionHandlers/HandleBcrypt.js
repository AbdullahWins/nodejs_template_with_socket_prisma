const bcrypt = require("bcrypt");
const { logger } = require("../logHandlers/HandleWinston");

const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const stringPassword = password?.toString();
    const hashedPassword = await bcrypt.hash(stringPassword, saltRounds);
    logger.log("info", "Password hashed successfully");
    return hashedPassword;
  } catch (error) {
    logger.log("error", error?.message);
    return null;
  }
};

const comparePasswords = async (inputPassword, hashedPassword) => {
  try {
    const stringInputPassword = inputPassword?.toString();
    const stringHashedPassword = hashedPassword?.toString();

    const passwordMatch = await bcrypt.compare(
      stringInputPassword,
      stringHashedPassword
    );
    if (!passwordMatch) {
      logger.log("error", "Password did not match");
      return false;
    } else {
      logger.log("info", "Password matched");
      return true;
    }
  } catch (error) {
    logger.log("error", error?.message);
    return false;
  }
};

module.exports = { hashPassword, comparePasswords };
