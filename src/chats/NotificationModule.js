const { logger } = require("../services/logHandlers/HandleWinston");
const { CustomError } = require("../services/responseHandlers/HandleResponse");
const { getIoInstance } = require("../../config/server/socket/socket");
const Notification = require("../models/Notification/NotificationModel");
const { Timekoto } = require("timekoto");

const sendNotification = async (data, message, type, logMessage) => {
  try {
    const {
      senderId,
      senderName,
      senderImage,
      receiverId,
      entityId,
      entityType,
    } = data;

    // Process data
    const processedData = {
      sender: senderId,
      senderImage: senderImage,
      senderName: senderName,
      receiver: receiverId,
      entityId: entityId,
      entityType: entityType,
      message: message,
      type: type,
    };
    console.log("processedData", processedData);

    // Add notification to database
    await Notification.addOneNotification(processedData);

    // Send notification to receiver
    const io = getIoInstance();
    io.to(receiverId).emit("notification", {
      ...processedData,
      createdAt: Timekoto(),
    });

    // Log the notification
    logger.log({
      level: "debug",
      message: logMessage,
    });
  } catch (error) {
    throw new CustomError(
      error?.statusCode || 500,
      error?.message || "Internal Server Error"
    );
  }
};

const sendNotificationToMany = async (data) => {
  try {
    const {
      senderId,
      senderName,
      senderImage,
      receiverIds,
      entityId,
      entityType,
      message,
      type,
      logMessage,
    } = data;

    // Process data
    const processedData = {
      sender: senderId,
      senderName: senderName,
      senderImage: senderImage,
      receivers: receiverIds,
      entityId: entityId,
      entityType: entityType,
      message: message,
      type: type,
    };
    console.log("processedData", processedData);

    // Add notification to database
    await Notification.addOneNotification(processedData);

    // Send notification to all the receivers
    const io = getIoInstance();
    receiverIds.forEach((id) => {
      io.to(id.toString()).emit("notification", {
        ...processedData,
        createdAt: Timekoto(),
      });
    });

    // Log the notification
    logger.log({
      level: "debug",
      message: logMessage,
    });
  } catch (error) {
    throw new CustomError(
      error?.statusCode || 500,
      error?.message || "Internal Server Error"
    );
  }
};

// Handle friend request notification
const handleFriendRequestNotification = async (data) => {
  const { senderName, senderId, receiverId } = data;
  const message = `${senderName} sent you a friend request!`;
  const type = "incomingFriendRequest";
  const logMessage = `NOTIFICATION: ${senderName} with userId: ${senderId} sent a friend request to ${receiverId}!`;
  await sendNotification(data, message, type, logMessage);
};

// Handle accepted friend request notification
const handleAcceptedFriendRequestNotification = async (data) => {
  const { senderName, senderId, receiverId } = data;
  const message = `${senderName} accepted your friend request!`;
  const type = "acceptedFriendRequest";
  const logMessage = `NOTIFICATION: ${senderName} with userId: ${senderId} accepted a friend request from ${receiverId}!`;
  await sendNotification(data, message, type, logMessage);
};

// Handle group join notification
const handleGroupJoinNotification = async (data) => {
  const { senderName, senderId, receiverId, entityId } = data;
  const message = `${senderName} joined your group!`;
  const type = "groupJoin";
  const logMessage = `NOTIFICATION: ${senderName} with userId: ${senderId} joined the group ${entityId}!`;
  await sendNotification(data, message, type, logMessage);
};

// Handle group leave notification
const handleGroupLeaveNotification = async (data) => {
  const { senderName, senderId, receiverId, entityId } = data;
  const message = `${senderName} left your group!`;
  const type = "groupLeave";
  const logMessage = `NOTIFICATION: ${senderName} with userId: ${senderId} left the group ${entityId}!`;
  await sendNotification(data, message, type, logMessage);
};

module.exports = {
  handleFriendRequestNotification,
  handleAcceptedFriendRequestNotification,
  handleGroupJoinNotification,
  handleGroupLeaveNotification,
};
