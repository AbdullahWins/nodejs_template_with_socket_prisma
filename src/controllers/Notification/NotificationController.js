//notification controller

const { asyncHandler } = require("../../middlewares/AsyncHandler");
const Notification = require("../../models/Notification/NotificationModel");
const { logger } = require("../../services/logHandlers/HandleWinston");
const {
  CustomError,
  sendResponse,
} = require("../../services/responseHandlers/HandleResponse");

const getAllNotificationsByUser = async (req, res) => {
  //get userId from auth middleware
  const userId = req?.auth?._id;
  if (!userId) {
    throw new CustomError(401, "Unauthorized");
  }

  //perform query on database
  const notifications = await Notification.getNotificationsByUserId(userId);
  logger.log("info", `Found ${notifications?.length} notifications`);
  return sendResponse(res, 200, "Fetched all notifications", notifications);
};

module.exports = {
  getAllNotificationsByUser: asyncHandler(getAllNotificationsByUser),
};
