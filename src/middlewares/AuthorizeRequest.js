const { logger } = require("../services/logHandlers/HandleWinston");
const { verifyToken } = require("../services/tokenHandlers/HandleJwt");
const Admin = require("../models/Admin/AdminModel");
const User = require("../models/User/UserModel");
const { AuthDTO } = require("../dtos/AuthDTO");
const {
  sendResponse,
  CustomError,
} = require("../services/responseHandlers/HandleResponse");

// Middleware to authorize admin or user
const authorizeRequest = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    logger.log("warn", "Unauthorized Access!");
    return sendResponse(res, 401, "Unauthorized Access!");
  }

  try {
    let role;
    let entity;

    // Verify the token
    const decodedToken = await verifyToken(token);

    // Check if decoded token has user ID
    if (decodedToken._id) {
      const userDoc = await User.findById(decodedToken._id);
      if (userDoc) {
        role = "user";
        entity = userDoc;
      }
    }

    // Check if decoded token has admin ID
    if (!entity && decodedToken._id) {
      const adminDoc = await Admin.findById(decodedToken._id);
      if (adminDoc) {
        role = "admin";
        entity = adminDoc;
      }
    }

    // If neither user nor admin, throw error
    if (!entity) {
      logger.log("warn", "Invalid token or no valid user/admin exists!");
      throw new CustomError(
        403,
        "Invalid token or no valid user/admin exists!"
      );
    }

    logger.log(
      "info",
      `${role.charAt(0).toUpperCase() + role.slice(1)}: ${
        entity.email
      } is accessing the API!`
    );

    // Create AuthDTO object and attach to request
    const authDTO = new AuthDTO({
      _id: entity._id,
      fullName: entity.fullName,
      email: entity.email,
      role: role,
    });

    logger.log("info", "Request authorized successfully!");
    req.auth = authDTO;
    next();
  } catch (error) {
    logger.log("error", error?.message);
    return sendResponse(res, 403, error?.message);
  }
};

// Authorize admin
const authorizeAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    logger.log("warn", "Unauthorized Access!");
    return sendResponse(res, 401, "Unauthorized Access!");
  }

  try {
    const admin = await verifyToken(token);
    if (!admin) {
      logger.log("warn", "Invalid token!");
      throw new CustomError(403, "Invalid token!");
    }
    const adminDoc = await Admin.findById(admin._id);
    if (!adminDoc) {
      logger.log("warn", "No valid admin exists with the given token!");
      throw new CustomError(403, "No valid admin exists with the given token!");
    }

    // Create AuthDTO object and attach to request
    const authDTO = new AuthDTO({
      _id: adminDoc._id,
      fullName: adminDoc.fullName,
      email: adminDoc.email,
      role: "admin",
    });

    logger.log("info", "Request authorized successfully!");
    req.auth = authDTO;
    next();
  } catch (error) {
    logger.log("error", error?.message);
    return sendResponse(res, 403, error?.message);
  }
};

//check if the user is accessing his own data
const isUserAccessingOwnData = (req, res, next) => {
  try {
    const { auth, params } = req;
    //return if its an admin
    if (auth.role === "admin") {
      return next();
    }
    const authId = auth._id.toString();
    const paramsId = params.id.toString();

    if (authId !== paramsId) {
      logger.log(
        "warn",
        "This user does not have access to access other user data!"
      );
      return sendResponse(
        res,
        403,
        "This user does not have access to access other user data!"
      );
    }
    next();
  } catch (error) {
    logger.log("error", error?.message);
    return sendResponse(res, 500, error?.message);
  }
};

module.exports = { authorizeRequest, authorizeAdmin, isUserAccessingOwnData };
