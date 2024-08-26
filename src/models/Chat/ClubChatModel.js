// models/ClubChatMessageSchema.js

const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const { ClubChatFetchDTO } = require("../../dtos/ChatDTO");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");

const clubChatMessageSchema = new mongoose.Schema({
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
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

//get chats for a club
clubChatMessageSchema.statics.getAllChatsByClubId = async function (data) {
  try {
    const { clubId, page, limit } = data;
    //get last 20 chats for the club
    const chats = await this.find({ club: clubId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "club",
      })
      .exec();

    if (chats.length === 0) {
      throw new CustomError(404, "No chat found for this club");
    }

    // Transform user objects into DTO format for each event
    const transformedChats = chats.map((chat) => {
      const chatDTO = new ClubChatFetchDTO(chat);
      return chatDTO;
    });

    return transformedChats;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//add a new chat message
clubChatMessageSchema.statics.addClubChatMessage = async function (data) {
  try {
    const { sender, club, message, attachment } = data;
    if (!sender || !club) {
      throw new CustomError(400, "Sender and club are required");
    }
    const newChat = await this.create({
      sender: sender,
      club: club,
      message: message,
      attachment: attachment,
    });

    return newChat;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get the last message of a club
clubChatMessageSchema.statics.getLastMessageOfClub = async function (clubId) {
  try {
    const lastMessage = await this.findOne({ club: clubId })
      .sort({ createdAt: -1 })
      .populate({ path: "sender", select: "-password" })
      .exec();

    if (!lastMessage) {
      return null;
    }

    const chatDTO = new ClubChatFetchDTO(lastMessage);
    return chatDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

const ClubChatMessage = mongoose.model(
  "ClubChatMessage",
  clubChatMessageSchema
);

module.exports = ClubChatMessage;
