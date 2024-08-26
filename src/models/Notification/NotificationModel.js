// models/NotificationMessage.js

const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");
const {
  ENUM_NOTIFICATION_TYPE,
  ENUM_ENTITY_TYPE,
} = require("../../constants/NotificationConstants");
const { NotificationFetchDTO } = require("../../dtos/NotificationDTO");

const notificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  senderName: {
    type: String,
    required: true,
  },
  senderImage: {
    type: String,
    default: "",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // receivers: {
  //   type: [mongoose.Schema.Types.ObjectId],
  //   default: [],
  // },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  entityType: {
    type: String,
    enum: ENUM_ENTITY_TYPE,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ENUM_NOTIFICATION_TYPE,
    required: true,
  },
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

// Populate entities based on entityTypes
notificationSchema.statics.populateEntity = async function (notification) {
  if (!notification.entityId || !notification.entityType) {
    throw new CustomError(
      400,
      "EntityId and EntityType are required for population"
    );
  }

  // Construct the populate query based on entityType
  let populateOptions = {};
  switch (notification.entityType) {
    case "user":
      populateOptions = { path: "entityId", model: "User" };
      break;
    case "post":
      populateOptions = { path: "entityId", model: "Post" };
      break;
    case "group":
      populateOptions = { path: "entityId", model: "Group" };
      break;
    case "event":
      populateOptions = { path: "entityId", model: "Event" };
      break;
    case "club":
      populateOptions = { path: "entityId", model: "Club" };
      break;
    case "coffeeMeeting":
      populateOptions = { path: "entityId", model: "CoffeeMeeting" };
      break;
    default:
      throw new CustomError(400, "Invalid entityType");
  }

  // Populate the entity based on the dynamic model
  return this.populate(notification, populateOptions);
};

//get all notifications for a user
notificationSchema.statics.getNotificationsByUserId = async function (userId) {
  try {
    const notifications = await this.find({ receiver: userId }).sort({
      createdAt: -1,
    });
    if (notifications?.length === 0) {
      throw new CustomError(404, "No notifications found for this user");
    }
    return notifications.map(
      (notification) => new NotificationFetchDTO(notification)
    );
  } catch (error) {
    throw new CustomError(error?.statusCode || 500, error?.message);
  }
};

// Add a notification
notificationSchema.statics.addOneNotification = async function (notification) {
  try {
    if (!notification) {
      throw new CustomError(400, "Notification object is required");
    }
    const newNotification = await this.create(notification);
    return new NotificationFetchDTO(newNotification);
  } catch (error) {
    throw new CustomError(error?.statusCode || 500, error?.message);
  }
};

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
