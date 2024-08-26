const {
  authorizeAdmin,
  authorizeRequest,
  isUserAccessingOwnData,
} = require("../../middlewares/AuthorizeRequest");
const UserRouter = require("express").Router();

const {
  getOneUser,
  getUserByKeyword,
  getUserByName,
  getAllUsers,
  loginUser,
  registerUser,
  loginOrRegisterProvider,
  checkUsernameOrEmail,
  updateUserById,
  sendPasswordResetOTP,
  validatePasswordResetOTP,
  updateUserPasswordByOTP,
  updateUserPasswordByOldPassword,
  deleteUserById,
  suggestFriendsByHobbies,
  suggestFriendsByCurrentLocation,
  getReceivedFriendRequests,
  getSentFriendRequests,
  sendOneFriendRequest,
  acceptOneFriendRequest,
  cancelOrRemoveFriend,
  modifyCurrentLocation,
} = require("../../controllers/User/UserController");
const { loginRateLimiter } = require("../../middlewares/RateLimiters");

UserRouter.get("/find/:id", authorizeRequest, getOneUser);
UserRouter.get("/search/:keyword", authorizeRequest, getUserByKeyword);
UserRouter.get("/name/:name", authorizeRequest, getUserByName);
UserRouter.get("/all", authorizeRequest, getAllUsers);
UserRouter.post("/register", registerUser);
UserRouter.post("/login-or-register", loginOrRegisterProvider);
UserRouter.post("/check", checkUsernameOrEmail);
UserRouter.post("/login", loginRateLimiter, loginUser);
UserRouter.post("/send-otp", sendPasswordResetOTP);
UserRouter.post("/validate-otp", validatePasswordResetOTP);
UserRouter.patch("/reset", updateUserPasswordByOTP);
UserRouter.patch(
  "/update/:id",
  authorizeRequest,
  isUserAccessingOwnData,
  updateUserById
);
UserRouter.patch("/resetpassword/:email", updateUserPasswordByOldPassword);
UserRouter.delete(
  "/delete/:id",
  authorizeRequest,
  isUserAccessingOwnData,
  deleteUserById
);

//friend requests

UserRouter.get("/suggested-friends", authorizeRequest, suggestFriendsByHobbies);
UserRouter.get("/near-me", authorizeRequest, suggestFriendsByCurrentLocation);

UserRouter.get(
  "/received-friend-requests",
  authorizeRequest,
  getReceivedFriendRequests
);
UserRouter.get(
  "/sent-friend-requests",
  authorizeRequest,
  getSentFriendRequests
);

UserRouter.post(
  "/send-friend-request/:id",
  authorizeRequest,
  sendOneFriendRequest
);
UserRouter.post(
  "/accept-friend-request/:id",
  authorizeRequest,
  acceptOneFriendRequest
);
UserRouter.delete(
  "/cancel-friend-request/:id",
  authorizeRequest,
  cancelOrRemoveFriend
);
UserRouter.patch("/update-location", authorizeRequest, modifyCurrentLocation);

module.exports = UserRouter;
