// models/EventChatMessageSchema.js

const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const { EventChatFetchDTO } = require("../../dtos/ChatDTO");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");

const eventChatMessageSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
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

//get chats for a event
eventChatMessageSchema.statics.getAllChatsByEventId = async function (data) {
  try {
    const { eventId, page, limit } = data;
    //get last 20 chats for the event
    const chats = await this.find({ event: eventId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "event",
      })
      .exec();

    if (chats.length === 0) {
      throw new CustomError(404, "No chat found for this event");
    }

    // Transform user objects into DTO format for each event
    const transformedChats = chats.map((chat) => {
      const chatDTO = new EventChatFetchDTO(chat);
      return chatDTO;
    });

    return transformedChats;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//add a new chat message
eventChatMessageSchema.statics.addEventChatMessage = async function (data) {
  try {
    const { sender, event, message, attachment } = data;
    if (!sender || !event) {
      throw new CustomError(400, "Sender and event are required");
    }
    const newChat = await this.create({
      sender: sender,
      event: event,
      message: message,
      attachment: attachment,
    });

    return newChat;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get the last message of a event
eventChatMessageSchema.statics.getLastMessageOfEvent = async function (
  eventId
) {
  try {
    const lastMessage = await this.findOne({ event: eventId })
      .sort({ createdAt: -1 })
      .populate({ path: "sender", select: "-password" })
      .exec();

    if (!lastMessage) {
      return null;
    }

    const chatDTO = new EventChatFetchDTO(lastMessage);
    return chatDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

const EventChatMessage = mongoose.model(
  "EventChatMessage",
  eventChatMessageSchema
);

module.exports = EventChatMessage;
