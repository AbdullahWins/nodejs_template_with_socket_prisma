//notification constants

const ENUM_NOTIFICATION_TYPE = {
  incomingFriendRequest: "incomingFriendRequest",
  acceptedFriendRequest: "acceptedFriendRequest",
  postComment: "postComment",
  commentReply: "commentReply",
  groupJoin: "groupJoin",
  groupLeave: "groupLeave",
  clubJoin: "clubJoin",
  clubLeave: "clubLeave",
  eventJoin: "eventJoin",
  eventLeave: "eventLeave",
  coffeeMeeting: "coffeeMeeting",
};

const ENUM_ENTITY_TYPE = {
  user: "user",
  post: "post",
  group: "group",
  event: "event",
  club: "club",
  coffeeMeeting: "coffeeMeeting",
};

module.exports = {
  ENUM_NOTIFICATION_TYPE,
  ENUM_ENTITY_TYPE,
};
