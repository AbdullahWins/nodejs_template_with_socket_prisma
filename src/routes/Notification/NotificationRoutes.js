const NotificationRouter = require("express").Router();
const {
  getAllNotificationsByUser,
} = require("../../controllers/Notification/NotificationController");
const { authorizeRequest } = require("../../middlewares/AuthorizeRequest");

NotificationRouter.get(
  "/get-own-notifications",
  authorizeRequest,
  getAllNotificationsByUser
);

module.exports = NotificationRouter;
