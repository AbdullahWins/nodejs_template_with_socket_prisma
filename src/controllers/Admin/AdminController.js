const Admin = require("../../models/Admin/AdminModel");
const {
  handleFileUpload,
} = require("../../services/fileHandlers/HandleFileUpload");
const {
  sendOTP,
  validateOTP,
} = require("../../services/otpHandlers/HandleOTP");
const {
  sendResponse,
} = require("../../services/responseHandlers/HandleResponse");
const { asyncHandler } = require("../../middlewares/AsyncHandler");
const { logger } = require("../../services/logHandlers/HandleWinston");
const {
  hashPassword,
} = require("../../services/encryptionHandlers/HandleBcrypt");
const {
  ObjectIdChecker,
} = require("../../services/validationHandlers/ObjectIdChecker");

// Login Admin using mongoose
const loginAdmin = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { email, password } = data;
  const result = await Admin.login({ email, password });
  logger.log("info", `Admin logged in: ${email}`);
  return sendResponse(res, 200, "Admin logged in successfully", result);
};

// Register Admin using mongoose
const registerAdmin = async (req, res) => {
  const { fullName, email, password } = JSON.parse(req?.body?.data);
  if (!fullName || !email || !password) {
    return sendResponse(res, 400, "Missing required fields");
  }
  const result = await Admin.register({ fullName, email, password });
  logger.log("info", `Admin registered: ${email}`);
  return sendResponse(res, 201, "Admin registered successfully", result);
};

// Get all Admins using mongoose
const getAllAdmins = async (req, res) => {
  const admins = await Admin.getAllAdmins();
  logger.log("info", `Found ${admins?.length} admins`);
  return sendResponse(res, 200, "Admins retrieved successfully", admins);
};

// Get Admin by id using mongoose
const getOneAdmin = async (req, res) => {
  const adminId = req?.params?.id;

  if (!ObjectIdChecker(adminId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  const admin = await Admin.getOneAdmin({ id: adminId });
  logger.log("info", JSON.stringify(admin, null, 2));
  return sendResponse(res, 200, "Admin retrieved successfully", admin);
};

// Update Admin by id using mongoose
const updateAdminById = async (req, res) => {
  const id = req?.params?.id;

  if (!ObjectIdChecker(id)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  const { files } = req;
  const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
  const { password, ...additionalData } = data;
  const folderName = "admins";
  let updatedData = {};

  if (files?.single) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.single,
      folderName,
    });
    const profileImage = fileUrls[0];
    updatedData = { ...updatedData, profileImage };
  }

  if (password) {
    const hashedPassword = await hashPassword(password);
    updatedData = { ...updatedData, password: hashedPassword };
  }

  if (Object.keys(additionalData).length > 0) {
    updatedData = { ...updatedData, ...additionalData };
  }

  logger.log("info", JSON.stringify(updatedData, null, 2));

  const updatedAdmin = await Admin.updateAdminById({ id, updatedData });
  logger.log("info", "Admin updated successfully");
  return sendResponse(res, 200, "Admin updated successfully", updatedAdmin);
};

// Send password reset OTP
const sendPasswordResetOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { email } = data;
  //check if email exists
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return sendResponse(res, 404, "Admin not found");
  }
  const result = await sendOTP({ email });
  if (result?.error) {
    logger.log("error", result?.error);
    return sendResponse(res, 401, result?.error);
  } else {
    logger.log("info", result?.message);
    return sendResponse(res, 200, result?.message);
  }
};

const validatePasswordResetOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { otp, email } = data;
  if (!otp || !email) {
    return sendResponse(res, 400, "All fields are required");
  }
  //check if email exists
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return sendResponse(res, 404, "Admin not found");
  }
  const result = await validateOTP({ email, otp });
  if (result?.error) {
    logger.log("error", result?.error);
    return sendResponse(res, 401, result?.error);
  } else {
    logger.log("info", result?.message);
    return sendResponse(res, 200, result?.message);
  }
};

// Update admin password by OTP
const updateAdminPasswordByOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { otp, email, newPassword } = data;

  const updatedAdmin = await Admin.updatePasswordByOTP({
    email,
    otp,
    newPassword,
  });
  logger.log(
    "info",
    `Password updated successfully for: ${updatedAdmin?.email}`
  );
  return sendResponse(res, 200, "Password updated successfully", updatedAdmin);
};

// Update admin password by old password
const updateAdminPasswordByOldPassword = async (req, res) => {
  const email = req?.params?.email;
  const data = JSON.parse(req?.body?.data);
  const { oldPassword, newPassword } = data;

  const updatedAdmin = await Admin.updatePasswordByEmail({
    email,
    oldPassword,
    newPassword,
  });
  if (!updatedAdmin) {
    return sendResponse(res, 401, "Failed to update password");
  }
  if (updatedAdmin?.error) {
    return sendResponse(res, 400, updatedAdmin?.error);
  }
  logger.log("info", "Password updated successfully");
  return sendResponse(res, 200, "Password updated successfully", updatedAdmin);
};

// Delete admin by id using mongoose
const deleteAdminById = async (req, res) => {
  const id = req?.params?.id;

  if (!ObjectIdChecker(id)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  const deletionResult = await Admin.deleteAdminById(id);
  logger.log("info", deletionResult?.message);
  return sendResponse(res, 200, deletionResult?.message);
};

module.exports = {
  getOneAdmin: asyncHandler(getOneAdmin),
  getAllAdmins: asyncHandler(getAllAdmins),
  updateAdminById: asyncHandler(updateAdminById),
  sendPasswordResetOTP: asyncHandler(sendPasswordResetOTP),
  validatePasswordResetOTP: asyncHandler(validatePasswordResetOTP),
  updateAdminPasswordByOTP: asyncHandler(updateAdminPasswordByOTP),
  loginAdmin: asyncHandler(loginAdmin),
  registerAdmin: asyncHandler(registerAdmin),
  updateAdminPasswordByOldPassword: asyncHandler(
    updateAdminPasswordByOldPassword
  ),
  deleteAdminById: asyncHandler(deleteAdminById),
};
