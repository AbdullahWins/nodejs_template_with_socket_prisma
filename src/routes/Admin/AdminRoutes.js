const {
  authorizeAdmin,
  authorizeRequest,
} = require("../../middlewares/AuthorizeRequest");
const AdminRouter = require("express").Router();

const {
  getOneAdmin,
  getAllAdmins,
  loginAdmin,
  registerAdmin,
  updateAdminById,
  sendPasswordResetOTP,
  validatePasswordResetOTP,
  updateAdminPasswordByOTP,
  updateAdminPasswordByOldPassword,
  deleteAdminById,
} = require("../../controllers/Admin/AdminController");
const { loginRateLimiter } = require("../../middlewares/RateLimiters");

AdminRouter.get("/find/:id", authorizeAdmin, getOneAdmin);
AdminRouter.get("/all", authorizeAdmin, getAllAdmins);
AdminRouter.post("/register", registerAdmin);
AdminRouter.post("/login", loginRateLimiter, loginAdmin);
AdminRouter.post("/send-otp", sendPasswordResetOTP);
AdminRouter.post("/validate-otp", validatePasswordResetOTP);
AdminRouter.patch("/reset", updateAdminPasswordByOTP);
AdminRouter.patch("/update/:id", authorizeAdmin, updateAdminById);
AdminRouter.patch("/resetpassword/:email", updateAdminPasswordByOldPassword);
AdminRouter.delete("/delete/:id", authorizeAdmin, deleteAdminById);

module.exports = AdminRouter;
