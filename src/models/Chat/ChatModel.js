// // models/ChatMessage.js

// const mongoose = require("mongoose");
// const { Timekoto } = require("timekoto");
// const { ChatFetchDTO } = require("../../dtos/ChatDTO");
// const {
//   CustomError,
// } = require("../../services/responseHandlers/HandleResponse");
// const {
//   UserFetchDTO,
//   UserChatDTO,
//   UserLastChatDTO,
// } = require("../../dtos/UserDTO");

// const chatMessageSchema = new mongoose.Schema({
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   receiver: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   group: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "GroupChat",
//   },
//   message: {
//     type: String,
//     required: true,
//   },
//   isGroupChat: {
//     type: Boolean,
//     default: false,
//   },
//   createdAt: {
//     type: Number,
//     default: () => {
//       return Timekoto();
//     },
//   },
// });

// //get all chats
// chatMessageSchema.statics.getAllChats = async function () {
//   try {
//     //get last 20 chats
//     const chats = await this.find()
//       .sort({ createdAt: -1 })
//       .limit(20)
//       .populate({
//         path: "sender",
//         select: "-password",
//       })
//       .populate({
//         path: "receiver",
//         select: "-password",
//       })
//       .populate({
//         path: "group",
//       })
//       .exec();

//     if (chats.length === 0) {
//       throw new CustomError(404, "No chat found");
//     }

//     // Transform user objects into DTO format for each event
//     const transformedChats = chats.map((chat) => {
//       const chatDTO = new ChatFetchDTO(chat);
//       return chatDTO;
//     });

//     return transformedChats;
//   } catch (error) {
//     throw new CustomError(error?.statusCode, error?.message);
//   }
// };

// //get chats for a user
// chatMessageSchema.statics.getAllChatsByUser = async function (userId) {
//   try {
//     //get last 20 chats for the user
//     const chats = await this.find({
//       $or: [{ sender: userId }, { receiver: userId }],
//     })
//       .sort({ createdAt: -1 })
//       .limit(20)
//       .populate({
//         path: "sender",
//         select: "-password",
//       })
//       .populate({
//         path: "receiver",
//         select: "-password",
//       })
//       .populate({
//         path: "group",
//       })
//       .exec();

//     if (chats.length === 0) {
//       throw new CustomError(404, "No chat found for this user");
//     }

//     // Transform user objects into DTO format for each event
//     const transformedChats = chats.map((chat) => {
//       const chatDTO = new ChatFetchDTO(chat);
//       return chatDTO;
//     });

//     return transformedChats;
//   } catch (error) {
//     throw new CustomError(error?.statusCode, error?.message);
//   }
// };

// //get users whom the user has chatted with
// // chatMessageSchema.statics.getChattedUsers = async function (userId) {
// //   try {
// //     //get all the users whom the user has chatted with
// //     const chats = await this.find({
// //       $or: [{ sender: userId }, { receiver: userId }],
// //     })
// //       .sort({ createdAt: -1 })
// //       .limit(20)
// //       .populate({ path: "sender", select: "-password" })
// //       .populate({ path: "receiver", select: "-password" })
// //       .exec();

// //     if (chats.length === 0) {
// //       throw new CustomError(
// //         404,
// //         "No user found whom the user has chatted with"
// //       );
// //     }
// //     //get all the users whom the user has chatted with
// //     let users = [];

// //     // Get all the users whom the user has chatted with
// //     chats.forEach((chat) => {
// //       //check if the id is already in the users array
// //       if (chat.sender._id.toString() !== userId) {
// //         if (!users.some((user) => user._id === chat.sender._id)) {
// //           users.push(chat.sender);
// //         }
// //       } else {
// //         if (!users.some((user) => user._id === chat.receiver._id)) {
// //           users.push(chat.receiver);
// //         }
// //       }
// //     });

// //     // Transform user objects into DTO format for each event
// //     const transformedUsers = users.map((user) => {
// //       const userDTO = new UserLastChatDTO(user);
// //       return userDTO;
// //     });

// //     return transformedUsers;
// //   } catch (error) {
// //     throw new CustomError(error?.statusCode, error?.message);
// //   }
// // };

// //get users whom the user has chatted with
// chatMessageSchema.statics.getChattedUsers = async function (userId) {
//   try {
//     // Get all the chats for the user, sorted by createdAt descending
//     const chats = await this.find({
//       $or: [{ sender: userId }, { receiver: userId }],
//     })
//       .sort({ createdAt: -1 })
//       .populate({ path: "sender", select: "-password" })
//       .populate({ path: "receiver", select: "-password" })
//       .exec();

//     if (chats.length === 0) {
//       throw new CustomError(
//         404,
//         "No user found whom the user has chatted with"
//       );
//     }

//     // Create a map to track the last message with each user
//     const userLastMessageMap = new Map();

//     // Iterate through the chats to populate the map with the last message for each user
//     for (const chat of chats) {
//       const otherUser = chat.sender._id.equals(userId)
//         ? chat.receiver
//         : chat.sender;

//       // Ensure that the otherUser is defined before proceeding
//       if (otherUser && otherUser._id) {
//         if (!userLastMessageMap.has(otherUser._id.toString())) {
//           userLastMessageMap.set(otherUser._id.toString(), {
//             user: otherUser,
//             lastMessage: chat,
//           });
//         }
//       }
//     }

//     // Transform user objects into DTO format along with the last message
//     const transformedUsers = Array.from(userLastMessageMap.values()).map(
//       ({ user, lastMessage }) => {
//         return new UserLastChatDTO(user, lastMessage);
//       }
//     );

//     return transformedUsers;
//   } catch (error) {
//     throw new CustomError(
//       error?.statusCode || 500,
//       error?.message || "Internal Server Error"
//     );
//   }
// };

// //get chats for a group
// chatMessageSchema.statics.getAllChatsByGroup = async function (groupId) {
//   try {
//     //get last 20 chats for the group
//     const chats = await this.find({ group: groupId })
//       .sort({ createdAt: -1 })
//       .limit(20)
//       .populate({
//         path: "sender",
//         select: "-password",
//       })
//       .populate({
//         path: "receiver",
//         select: "-password",
//       })
//       .populate({
//         path: "group",
//       })
//       .exec();

//     if (chats.length === 0) {
//       throw new CustomError(404, "No chat found for this group");
//     }

//     // Transform user objects into DTO format for each event
//     const transformedChats = chats.map((chat) => {
//       const chatDTO = new ChatFetchDTO(chat);
//       return chatDTO;
//     });

//     return transformedChats;
//   } catch (error) {
//     throw new CustomError(error?.statusCode, error?.message);
//   }
// };

// //get chats between two users
// chatMessageSchema.statics.getAllChatsBetweenUsers = async function (
//   userId,
//   otherUserId
// ) {
//   try {
//     //get last 20 chats between two users
//     const chats = await this.find({
//       $or: [
//         { sender: userId, receiver: otherUserId },
//         { sender: otherUserId, receiver: userId },
//       ],
//     })
//       .sort({ createdAt: -1 })
//       .limit(20)
//       .populate({
//         path: "sender",
//         select: "-password",
//       })
//       .populate({
//         path: "receiver",
//         select: "-password",
//       })
//       .populate({
//         path: "group",
//       })
//       .exec();

//     if (chats.length === 0) {
//       throw new CustomError(404, "No chat found between these users");
//     }

//     // Transform user objects into DTO format for each event
//     const transformedChats = chats.map((chat) => {
//       const chatDTO = new ChatFetchDTO(chat);
//       return chatDTO;
//     });

//     return transformedChats;
//   } catch (error) {
//     throw new CustomError(error?.statusCode, error?.message);
//   }
// };

// //get all chat on a group
// chatMessageSchema.statics.getAllChatsByGroup = async function (groupId) {
//   try {
//     //get last 20 chats for the group
//     const chats = await this.find({ group: groupId })
//       .sort({ createdAt: -1 })
//       .limit(20)
//       .populate({
//         path: "sender",
//         select: "-password",
//       })
//       .populate({
//         path: "receiver",
//         select: "-password",
//       })
//       .populate({
//         path: "group",
//       })
//       .exec();

//     if (chats.length === 0) {
//       throw new CustomError(404, "No chat found for this group");
//     }

//     // Transform user objects into DTO format for each event
//     const transformedChats = chats.map((chat) => {
//       const chatDTO = new ChatFetchDTO(chat);
//       return chatDTO;
//     });

//     return transformedChats;
//   } catch (error) {
//     throw new CustomError(error?.statusCode, error?.message);
//   }
// };

// //get group chats for a user
// // chatMessageSchema.statics.getAllGroupChatsByUser = async function (userId) {
// //   try {
// //     //get all the group chats that userId is a part of the group
// //     const chats = await this.find({
// //       $and: [{ isGroupChat: true }, { receiver: userId }],
// //     })
// //       .sort({ createdAt: -1 })
// //       .limit(20)
// //       .populate({
// //         path: "sender",
// //         select: "-password",
// //       })
// //       .populate({
// //         path: "receiver",
// //         select: "-password",
// //       })
// //       .populate({
// //         path: "group",
// //       })
// //       .exec();

// //     if (chats.length === 0) {
// //       throw new CustomError(404, "No group chat found for this user");
// //     }

// //     // Transform user objects into DTO format for each event
// //     const transformedChats = chats.map((chat) => {
// //       const chatDTO = new ChatFetchDTO(chat);
// //       return chatDTO;
// //     });

// //     return transformedChats;
// //   } catch (error) {
// //     throw new CustomError(error?.statusCode, error?.message);
// //   }
// // };

// const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

// module.exports = ChatMessage;
