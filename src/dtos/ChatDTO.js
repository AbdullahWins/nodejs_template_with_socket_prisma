//Chat DTO
const { UserChatDTO } = require("./UserDTO");

class GroupChatDTO {
  constructor(group) {
    this._id = group?._id || null;
    this.name = group?.name || "";
    this.users = group?.users
      ? group.users.map((user) => new UserChatDTO(user))
      : [];
    this.createdAt = group?.createdAt || null;
  }
}

//group fetch dto
class GroupFetchDTO {
  constructor(group) {
    this._id = group?._id || null;
    this.name = group?.name || "";
    // this.users = group?.users ? group.users : [];
    this.createdAt = group?.createdAt || null;
  }
}

//club fetch dto
class ClubFetchDTO {
  constructor(club) {
    this._id = club?._id || null;
    this.name = club?.name || "";
    // this.users = club?.users ? club.users : [];
    this.createdAt = club?.createdAt || null;
  }
}

//event fetch dto
class EventFetchDTO {
  constructor(event) {
    this._id = event?._id || null;
    this.name = event?.name || "";
    // this.users = event?.users ? event.users : [];
    this.createdAt = event?.createdAt || null;
  }
}

// class ChatDTO {
//   constructor(chat) {
//     this._id = chat?._id || null;
//     this.sender = chat?.sender ? new UserChatDTO(chat?.sender) : null;
//     this.receiver = chat?.receiver ? new UserChatDTO(chat?.receiver) : null;
//     this.group = chat?.group ? new GroupFetchDTO(chat?.group) : null;
//     this.message = chat?.message || "";
//     this.isGroupChat = chat?.isGroupChat || false;
//     this.createdAt = chat?.createdAt || null;
//   }
// }

class ChatFetchDTO {
  constructor(chat) {
    this._id = chat?._id || null;
    this.sender = chat?.sender ? new UserChatDTO(chat?.sender) : null;
    this.receiver = chat?.receiver ? new UserChatDTO(chat?.receiver) : null;
    this.group = chat?.group ? new GroupFetchDTO(chat?.group) : null;
    this.message = chat?.message || "";
    this.isGroupChat = chat?.isGroupChat || false;
    this.createdAt = chat?.createdAt || null;
  }
}

// //individual chat fetch dto
// class IndividualChatFetchDTO {
//   constructor(chat) {
//     this._id = chat?._id || null;
//     this.sender = chat?.sender ? new UserChatDTO(chat.sender) : null;
//     this.receiver = chat?.receiver ? new UserChatDTO(chat.receiver) : null;
//     this.message = chat?.message || "";
//     this.attachment = chat?.attachment || "";
//     this.createdAt = chat?.createdAt || null;
//   }
// }

//individual chat fetch dto
class IndividualChatFetchDTO {
  constructor(userId, chat) {
    this._id = chat?._id || null;
    this.message = chat?.message || "";
    this.attachment = chat?.attachment || "";
    this.ismine = chat?.sender?._id.equals(userId) ? true : false;
    this.createdAt = chat?.createdAt || null;
  }
}

//group chat fetch dto
class GroupChatFetchDTO {
  constructor(chat) {
    this._id = chat?._id || null;
    this.sender = chat?.sender ? new UserChatDTO(chat?.sender) : null;
    this.group = chat?.group ? new GroupFetchDTO(chat?.group) : null;
    this.message = chat?.message || "";
    this.attachment = chat?.attachment || "";
    this.createdAt = chat?.createdAt || null;
  }
}

//club chat fetch dto
class ClubChatFetchDTO {
  constructor(chat) {
    this._id = chat?._id || null;
    this.sender = chat?.sender ? new UserChatDTO(chat?.sender) : null;
    this.club = chat?.club ? new ClubFetchDTO(chat?.club) : null;
    this.message = chat?.message || "";
    this.attachment = chat?.attachment || "";
    this.createdAt = chat?.createdAt || null;
  }
}

//event chat fetch dto
class EventChatFetchDTO {
  constructor(chat) {
    this._id = chat?._id || null;
    this.sender = chat?.sender ? new UserChatDTO(chat?.sender) : null;
    this.event = chat?.event ? new EventFetchDTO(chat?.event) : null;
    this.message = chat?.message || "";
    this.attachment = chat?.attachment || "";
    this.createdAt = chat?.createdAt || null;
  }
}

module.exports = {
  GroupChatDTO,
  GroupFetchDTO,
  // ChatDTO,
  ChatFetchDTO,
  IndividualChatFetchDTO,
  GroupChatFetchDTO,
  ClubChatFetchDTO,
  EventChatFetchDTO,
};
