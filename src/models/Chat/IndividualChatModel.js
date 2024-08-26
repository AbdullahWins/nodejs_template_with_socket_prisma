// models/ChatMessage.js

const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const { IndividualChatFetchDTO } = require("../../dtos/ChatDTO");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");
const {
  UserLastChatDTO,
  UserFetchDTO,
  UserChatDTO,
} = require("../../dtos/UserDTO");

const individualChatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiver: {
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

//get all users whom the user has chatted with
individualChatMessageSchema.statics.getIndivualChattedUsers = async function (
  userId
) {
  try {
    // Get all the chats for the user, sorted by createdAt descending
    const chats = await this.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate({ path: "sender", select: "-password" })
      .populate({ path: "receiver", select: "-password" })
      .exec();

    if (chats.length === 0) {
      throw new CustomError(
        404,
        "No user found whom the user has chatted with"
      );
    }

    // Create a map to track the last message with each user
    const userLastMessageMap = new Map();

    // Iterate through the chats to populate the map with the last message for each user
    for (const chat of chats) {
      const otherUser = chat?.sender?._id.equals(userId)
        ? chat?.receiver
        : chat?.sender;

      // Ensure that the otherUser is defined before proceeding
      if (otherUser && otherUser._id) {
        if (!userLastMessageMap.has(otherUser?._id?.toString())) {
          userLastMessageMap.set(otherUser?._id?.toString(), {
            user: otherUser,
            lastMessage: chat,
          });
        }
      }
    }

    // Transform user objects into DTO format along with the last message
    const transformedUsers = Array.from(userLastMessageMap?.values()).map(
      ({ user, lastMessage }) => {
        return new UserLastChatDTO(user, lastMessage);
      }
    );

    return transformedUsers;
  } catch (error) {
    throw new CustomError(
      error?.statusCode || 500,
      error?.message || "Internal Server Error"
    );
  }
};

//get chats between two users
individualChatMessageSchema.statics.getAllIndividualChatsBetweenTwoUser =
  async function (data) {
    try {
      const { userId, otherUserId, page, limit } = data;
      //get chats between two users
      const chats = await this.find({
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate({
          path: "sender",
          select: "-password",
        })
        .populate({
          path: "receiver",
          select: "-password",
        })
        .exec();

      if (chats?.length === 0) {
        throw new CustomError(404, "No chat found between these users");
      }

      //extract the userId of the person who is not the current user
      const otherUser = chats[0].sender._id.equals(userId)
        ? chats[0].receiver
        : chats[0].sender;

      //transform the other user object into DTO format
      const otherUserDTO = new UserChatDTO(otherUser);

      // Transform user objects into DTO format for each event
      const transformedChats = chats?.map((chat) => {
        const chatDTO = new IndividualChatFetchDTO(userId, chat);
        return chatDTO;
      });

      //now process the data to return the other user and the chats between the two users
      const processedData = {
        user: otherUserDTO,
        messages: transformedChats,
      };

      //return the other user and the chats between the two users
      return processedData;
    } catch (error) {
      throw new CustomError(error?.statusCode, error?.message);
    }
  };

//add a new chat message
individualChatMessageSchema.statics.addIndividualChatMessage = async function (
  data
) {
  try {
    const { sender, receiver, message, attachment } = data;
    if (!sender || !receiver) {
      throw new CustomError(400, "Sender and receiver are required");
    }
    const newChat = await this.create({
      sender: sender,
      receiver: receiver,
      message: message,
      attachment: attachment,
    });

    return newChat;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//delete all individual chats of a user
individualChatMessageSchema.statics.deleteAllIndividualChatsOfUser =
  async function (userId) {
    try {
      const result = await this.deleteMany({
        $or: [{ sender: userId }, { receiver: userId }],
      });

      if (result.deletedCount === 0) {
        throw new CustomError(404, "No chat found for the user");
      }

      return `All chats of the user with ID: ${userId} have been deleted`;
    } catch (error) {
      throw new CustomError(error?.statusCode, error?.message);
    }
  };

//delete a single chat message
individualChatMessageSchema.statics.deleteOneIndividualChatMessage =
  async function (chatId) {
    try {
      const result = await this.findByIdAndDelete(chatId);

      if (!result) {
        throw new CustomError(404, "Chat message not found");
      }

      return "Chat message deleted successfully";
    } catch (error) {
      throw new CustomError(error?.statusCode, error?.message);
    }
  };

const IndividualChatMessage = mongoose.model(
  "IndividualChatMessage",
  individualChatMessageSchema
);

module.exports = IndividualChatMessage;
