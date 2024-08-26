// models/GroupChatMessageSchema.js

const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const { GroupChatFetchDTO } = require("../../dtos/ChatDTO");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");

const groupChatMessageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: {
    type: String,
    default: "",
  },
  attachment: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

//get chats for a group
groupChatMessageSchema.statics.getAllChatsByGroupId = async function (data) {
  try {
    const { groupId, page, limit } = data;
    //get last 20 chats for the group
    const chats = await this.find({ group: groupId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "group",
      })
      .exec();

    if (chats.length === 0) {
      throw new CustomError(404, "No chat found for this group");
    }

    // Transform user objects into DTO format for each event
    const transformedChats = chats.map((chat) => {
      const chatDTO = new GroupChatFetchDTO(chat);
      return chatDTO;
    });

    return transformedChats;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//add a new chat message
groupChatMessageSchema.statics.addGroupChatMessage = async function (data) {
  try {
    const { sender, group, message, attachment } = data;
    if (!sender || !group) {
      throw new CustomError(400, "Sender and group are required");
    }
    const newChat = await this.create({
      sender: sender,
      group: group,
      message: message,
      attachment: attachment,
    });

    return newChat;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get the last message of a group
groupChatMessageSchema.statics.getLastMessageOfGroup = async function (
  groupId
) {
  try {
    const lastMessage = await this.findOne({ group: groupId })
      .sort({ createdAt: -1 })
      .populate({ path: "sender", select: "-password" })
      .exec();

    if (!lastMessage) {
      return null;
    }

    const chatDTO = new GroupChatFetchDTO(lastMessage);
    return chatDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

const GroupChatMessage = mongoose.model(
  "GroupChatMessage",
  groupChatMessageSchema
);

module.exports = GroupChatMessage;
