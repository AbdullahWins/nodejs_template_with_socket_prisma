//notification dto

const { Timekoto } = require("timekoto");

class BaseNotificationDTO {
  constructor(notification) {
    this._id = notification?._id || null;
    this.sender = notification?.sender || null;
    this.senderName = notification?.senderName || "";
    this.senderImage = notification?.senderImage || "";
    this.receiver = notification?.receiver || null;
    this.entityId = notification?.entityId || null;
    this.message = notification?.message || "";
    this.type = notification?.type || "";
    this.createdAt = notification?.createdAt || Timekoto();
  }
}

class NotificationFetchDTO extends BaseNotificationDTO {
  constructor(notification) {
    super(notification);
  }
}

module.exports = { NotificationFetchDTO };
