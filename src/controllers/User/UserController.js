const User = require("../../models/User/UserModel");
const {
  handleFileUpload,
} = require("../../services/fileHandlers/HandleFileUpload");
const {
  sendOTP,
  validateOTP,
} = require("../../services/otpHandlers/HandleOTP");
const { asyncHandler } = require("../../middlewares/AsyncHandler");
const { logger } = require("../../services/logHandlers/HandleWinston");
const {
  hashPassword,
} = require("../../services/encryptionHandlers/HandleBcrypt");
const {
  sendResponse,
} = require("../../services/responseHandlers/HandleResponse");
const {
  ObjectIdChecker,
} = require("../../services/validationHandlers/ObjectIdChecker");

// Login User using mongoose
const loginUser = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { email, password } = data;
  if (!email || !password) {
    return sendResponse(res, 400, "Missing required fields");
  }
  const result = await User.login({ email, password });
  logger.log("info", `User logged in: ${email}`);
  return sendResponse(res, 200, "User logged in successfully", result);
};

// Register User using mongoose
const registerUser = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { files } = req;

  const { email, password, username } = data;
  if (!email || !password) {
    return sendResponse(res, 400, "Missing required fields");
  }
  const folderName = "users";
  let updatedData = { ...data };
  if (username === undefined || username === null || username === "") {
    const nweUsername =
      email?.split("@")[0] + -+Math.floor(Math.random() * 1000);
    updatedData = { ...updatedData, username: nweUsername };
  }

  if (files?.single) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.single,
      folderName,
    });
    const profileImage = fileUrls[0];
    updatedData = { ...updatedData, profileImage };
  }

  if (files?.multiple) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.multiple,
      folderName,
    });
    const coverImage = fileUrls[0];
    updatedData = { ...updatedData, coverImage };
  }

  const result = await User.register(updatedData);
  logger.log("info", `User registered: ${email}`);
  return sendResponse(res, 201, "User registered successfully", result);
};

//login or register using provider
const loginOrRegisterProvider = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { id, email, photoUrl, provider, displayName } = data;
  if (!id || !email || !provider || !displayName) {
    return sendResponse(
      res,
      400,
      "id, email, provider, displayName are required!"
    );
  }
  const processedData = { id, email, photoUrl, provider, displayName };
  const result = await User.loginOrRegisterProvider(processedData);
  logger.log("info", `User logged in or registered: ${email}`);
  return sendResponse(
    res,
    200,
    "User logged in or registered successfully",
    result
  );
};

//check if the username or email is already taken by another user
const checkUsernameOrEmail = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { username, email } = data;
  if (!username && !email) {
    return sendResponse(res, 400, "email and username are required!");
  }
  const result = await User.checkUsernameOrEmail({ username, email });
  return sendResponse(res, 200, "Check completed successfully", result);
};

// Get all Users using mongoose
const getAllUsers = async (req, res) => {
  const users = await User.getAllUsers();
  logger.log("info", `Found ${users?.length} users`);
  return sendResponse(res, 200, "Users retrieved successfully", users);
};

// Get User by id using mongoose
const getOneUser = async (req, res) => {
  const userId = req?.params?.id;
  if (!ObjectIdChecker(userId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  const user = await User.getOneUser({ id: userId });
  logger.log("info", JSON.stringify(user, null, 2));
  return sendResponse(res, 200, "User retrieved successfully", user);
};

// Get user by keyword partial match
const getUserByKeyword = async (req, res) => {
  const keyword = req?.params?.keyword;
  const userId = req?.auth?._id;
  if (!keyword) {
    return sendResponse(
      res,
      400,
      `keyword is needed on params, use "all" for all users without any filter!`
    );
  }
  const users = await User.getUserByKeyword({ keyword, userId });
  if (!users?.length) {
    return sendResponse(res, 404, "No users found based on keyword", users);
  }
  return sendResponse(
    res,
    200,
    "Users retrieved successfully based on keyword",
    users
  );
};

//get user by username or fullname partial match
const getUserByName = async (req, res) => {
  const name = req?.params?.name;
  if (!name) {
    return sendResponse(res, 400, "name is needed on params");
  }
  const users = await User.getUserByName(name);
  if (!users?.length) {
    return sendResponse(res, 404, "No users found based on keyword", users);
  }
  return sendResponse(
    res,
    200,
    "Users retrieved successfully based on name",
    users
  );
};

// Update User by id using mongoose
const updateUserById = async (req, res) => {
  const id = req?.params?.id;

  if (!ObjectIdChecker(id)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  const { files } = req;
  const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
  const { password, ...additionalData } = data;
  const folderName = "users";
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

  if (files?.multiple) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.multiple,
      folderName,
    });
    const coverImage = fileUrls[0];
    updatedData = { ...updatedData, coverImage };
  }

  if (password) {
    const hashedPassword = await hashPassword(password);
    updatedData = { ...updatedData, password: hashedPassword };
  }

  if (Object.keys(additionalData).length > 0) {
    updatedData = { ...updatedData, ...additionalData };
  }

  logger.log("info", JSON.stringify(updatedData, null, 2));
  const updatedUser = await User.updateUserById({ id, updatedData });
  return sendResponse(res, 200, "User updated successfully", updatedUser);
};

// Send OTP for password reset
const sendPasswordResetOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { email } = data;
  //check if email exists
  const user = await User.findOne({ email });
  if (!user) {
    return sendResponse(res, 404, "User not found");
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

// Validate OTP for password reset
const validatePasswordResetOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { otp, email } = data;
  //check if email exists
  const user = await User.findOne({ email });
  if (!user) {
    return sendResponse(res, 404, "User not found");
  }
  const result = await validateOTP({ email, otp });
  if (result?.error) {
    logger.log("info", result?.error);
    return sendResponse(res, 401, result?.error);
  }
  logger.log("info", result);
  return sendResponse(res, 200, result?.message);
};

// Update User password by OTP
const updateUserPasswordByOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { otp, email, newPassword } = data;

  const updatedUser = await User.updatePasswordByOTP({
    email,
    otp,
    newPassword,
  });
  logger.log(
    "info",
    `Password updated successfully for: ${updatedUser?.email}`
  );
  if (!updatedUser) {
    return sendResponse(res, 400, "Failed to update password");
  }
  if (updatedUser?.error) {
    return sendResponse(res, 400, updatedUser?.error);
  }
  return sendResponse(res, 200, "Password updated successfully", updatedUser);
};

// Update User password by old password
const updateUserPasswordByOldPassword = async (req, res) => {
  const email = req?.params?.email;
  const data = JSON.parse(req?.body?.data);
  const { oldPassword, newPassword } = data;

  const updatedUser = await User.updatePasswordByEmail({
    email,
    oldPassword,
    newPassword,
  });

  return sendResponse(res, 200, "Password updated successfully", updatedUser);
};

// Delete User by id using mongoose
const deleteUserById = async (req, res) => {
  const id = req?.params?.id;

  if (!ObjectIdChecker(id)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  const deletionResult = await User.deleteUserById(id);
  logger.log("info", deletionResult?.message);
  return sendResponse(res, 200, deletionResult?.message);
};

//friends list operations

//get suggested friends by hobbies
const suggestFriendsByHobbies = async (req, res) => {
  const userId = req?.auth?._id;
  if (!ObjectIdChecker(userId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  const result = await User.suggestFriendsByHobbies({ userId });
  return sendResponse(
    res,
    200,
    "Suggested friends fetched successfully",
    result
  );
};

//get suggested friends by current location
const suggestFriendsByCurrentLocation = async (req, res) => {
  const userId = req?.auth?._id;
  if (!ObjectIdChecker(userId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  const result = await User.suggestFriendsByCurrentLocation({ userId });
  return sendResponse(
    res,
    200,
    "Suggested friends fetched successfully",
    result
  );
};

//get received friend requests
const getReceivedFriendRequests = async (req, res) => {
  const userId = req?.auth?._id;
  if (!ObjectIdChecker(userId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  const result = await User.getReceivedFriendRequests({ userId });
  return sendResponse(
    res,
    200,
    "Received requests fetched successfully",
    result
  );
};

//get requested friend requests
const getSentFriendRequests = async (req, res) => {
  const userId = req?.auth?._id;
  if (!ObjectIdChecker(userId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  const result = await User.getSentFriendRequests({ userId });
  return sendResponse(res, 200, "Sent requests fetched successfully", result);
};

// Send friend request to user
const sendOneFriendRequest = async (req, res) => {
  const userId = req?.auth?._id;
  const friendId = req?.params?.id;
  if (!ObjectIdChecker(userId) || !ObjectIdChecker(friendId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  const result = await User.sendOneFriendRequest({ userId, friendId });
  logger.log("info", result?.message);
  return sendResponse(res, 200, result?.message, result?.data);
};

//accept friend request
const acceptOneFriendRequest = async (req, res) => {
  const userId = req?.auth?._id;
  const friendId = req?.params?.id;
  if (!ObjectIdChecker(userId) || !ObjectIdChecker(friendId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  const result = await User.acceptOneFriendRequest({ userId, friendId });
  return sendResponse(res, 200, result?.message, result?.data);
};

//cancel or remove friend
const cancelOrRemoveFriend = async (req, res) => {
  const userId = req?.auth?._id;
  const friendId = req?.params?.id;
  if (!ObjectIdChecker(userId) || !ObjectIdChecker(friendId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  const result = await User.cancelOrRemoveFriend({ userId, friendId });
  return sendResponse(res, 200, result?.message, result?.data);
};

//modify current location
const modifyCurrentLocation = async (req, res) => {
  const userId = req?.auth?._id;
  const data = JSON.parse(req?.body?.data);
  const { position } = data;
  if (!ObjectIdChecker(userId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  if (!position) {
    return sendResponse(res, 400, "Missing required fields");
  }
  const result = await User.modifyCurrentLocation({
    userId,
    position,
  });
  return sendResponse(res, 200, result?.message, result?.data);
};

// Export all controllers
module.exports = {
  getOneUser: asyncHandler(getOneUser),
  getUserByKeyword: asyncHandler(getUserByKeyword),
  getUserByName: asyncHandler(getUserByName),
  getAllUsers: asyncHandler(getAllUsers),
  updateUserById: asyncHandler(updateUserById),
  sendPasswordResetOTP: asyncHandler(sendPasswordResetOTP),
  validatePasswordResetOTP: asyncHandler(validatePasswordResetOTP),
  updateUserPasswordByOTP: asyncHandler(updateUserPasswordByOTP),
  loginUser: asyncHandler(loginUser),
  registerUser: asyncHandler(registerUser),
  loginOrRegisterProvider: asyncHandler(loginOrRegisterProvider),
  checkUsernameOrEmail: asyncHandler(checkUsernameOrEmail),
  updateUserPasswordByOldPassword: asyncHandler(
    updateUserPasswordByOldPassword
  ),
  deleteUserById: asyncHandler(deleteUserById),
  //firend requests
  suggestFriendsByCurrentLocation: asyncHandler(
    suggestFriendsByCurrentLocation
  ),
  suggestFriendsByHobbies: asyncHandler(suggestFriendsByHobbies),
  getReceivedFriendRequests: asyncHandler(getReceivedFriendRequests),
  getSentFriendRequests: asyncHandler(getSentFriendRequests),
  sendOneFriendRequest: asyncHandler(sendOneFriendRequest),
  acceptOneFriendRequest: asyncHandler(acceptOneFriendRequest),
  cancelOrRemoveFriend: asyncHandler(cancelOrRemoveFriend),
  //location operations
  modifyCurrentLocation: asyncHandler(modifyCurrentLocation),
};
