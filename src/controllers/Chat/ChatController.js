const { logger } = require("../../services/logHandlers/HandleWinston");
const {
  ObjectIdChecker,
} = require("../../services/validationHandlers/ObjectIdChecker");
const {
  sendResponse,
} = require("../../services/responseHandlers/HandleResponse");
const { asyncHandler } = require("../../middlewares/AsyncHandler");
const {
  handleFileUpload,
} = require("../../services/fileHandlers/HandleFileUpload");
const ChatMessage = require("../../models/Chat/ChatModel");
const GroupChat = require("../../models/Chat/GroupChatModel");

/* """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
 *                                                                                        *
 *                               GROUP CHAT CONTROLLER                                    *
 *                                                                                        *
 """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" */

//get all group chats
const getAllChatGroups = async (req, res) => {
  const userId = req?.auth?._id;
  if (!userId) {
    return sendResponse(res, 401, "Unauthorized");
  }
  // Perform query on database
  const groups = await GroupChat.getAllChatGroups();
  logger.log("info", `Found ${groups?.length} chat groups`);
  return sendResponse(res, 200, "Fetched all chat groups", groups);
};

//get all groups by user
const getAllChatGroupsByUser = async (req, res) => {
  const userId = req?.auth?._id;
  if (!userId) {
    return sendResponse(res, 401, "Unauthorized");
  }
  // Perform query on database
  const groups = await GroupChat.getAllChatGroupsByUser(userId);
  logger.log("info", `Found ${groups?.length} chat groups by this user`);
  return sendResponse(res, 200, "Fetched all chat groups by this user", groups);
};

//get one group by id
const getChatGroupById = async (req, res) => {
  const groupId = req?.params?.groupId;
  //object id validation
  if (!ObjectIdChecker(groupId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  // Perform query on database
  const group = await GroupChat.getChatGroupById(groupId);
  logger.log("info", JSON.stringify(group, null, 2));
  return sendResponse(res, 200, "Chat group retrieved successfully", group);
};

/* """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
 *                                                                                        *
 *                                    CHAT CONTROLLER                                     *
 *                                                                                        *
 """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" */

//get all chats
const getAllChats = async (req, res) => {
  // Perform query on database
  const chats = await ChatMessage.getAllChats();
  logger.log("info", `Found ${chats?.length} chats`);
  return sendResponse(res, 200, "Fetched all chats", chats);
};

// Get all chats by user using mongoose
const getAllChatsByUser = async (req, res) => {
  const userId = req?.auth?._id;
  if (!userId) {
    return sendResponse(res, 401, "Unauthorized");
  }

  // Perform query on database
  const events = await ChatMessage.getAllChatsByUser(userId);
  logger.log("info", `Found ${events?.length} chats by this user`);
  return sendResponse(res, 200, "Fetched chats by this user", events);
};

//get users whom the user has chatted with
const getChattedUsers = async (req, res) => {
  const userId = req?.auth?._id;
  if (!userId) {
    return sendResponse(res, 401, "Unauthorized");
  }
  // Perform query on database
  const users = await ChatMessage.getChattedUsers(userId);
  logger.log(
    "info",
    `Found ${users?.length} users whom the user has chatted with`
  );
  return sendResponse(
    res,
    200,
    "Fetched users whom the user has chatted with",
    users
  );
};

//get all chats between two users
const getAllChatsBetweenUsers = async (req, res) => {
  const otherUserId = req?.params?.receiverId;
  const userId = req?.auth?._id;
  if (!userId || !otherUserId) {
    return sendResponse(res, 400, "Invalid request");
  }
  // Perform query on database
  const chats = await ChatMessage.getAllChatsBetweenUsers(userId, otherUserId);
  logger.log(
    "info",
    `Found ${chats?.length} chats between ${userId} and ${otherUserId}`
  );
  return sendResponse(
    res,
    200,
    `Fetched chats between ${userId} and ${otherUserId}`,
    chats
  );
};

//get all chats by group
const getAllChatsByGroup = async (req, res) => {
  const groupId = req?.params?.groupId;
  if (!groupId) {
    return sendResponse(res, 400, "Invalid request");
  }
  // Perform query on database
  const chats = await ChatMessage.getAllChatsByGroup(groupId);
  logger.log("info", `Found ${chats?.length} chatsfot ${groupId} group`);
  return sendResponse(res, 200, "Fetched all chats for this group", chats);
};

//get all group chats by user
// const getAllGroupChatsByUser = async (req, res) => {
//   const userId = req?.auth?._id;
//   if (!userId) {
//     return sendResponse(res, 401, "Unauthorized");
//   }
//   // Perform query on database
//   const chats = await ChatMessage.getAllGroupChatsByUser(userId);
//   logger.log("info", `Found ${chats?.length} chats by ${userId} user`);
//   return sendResponse(res, 200, "Fetched all group chats by this user", chats);
// };

module.exports = {
  getAllChatGroups: asyncHandler(getAllChatGroups),
  getAllChatGroupsByUser: asyncHandler(getAllChatGroupsByUser),
  getChatGroupById: asyncHandler(getChatGroupById),
  getAllChats: asyncHandler(getAllChats),
  getAllChatsByUser: asyncHandler(getAllChatsByUser),
  getChattedUsers: asyncHandler(getChattedUsers),
  getAllChatsBetweenUsers: asyncHandler(getAllChatsBetweenUsers),
  getAllChatsByGroup: asyncHandler(getAllChatsByGroup),
  // getAllGroupChatsByUser: asyncHandler(getAllGroupChatsByUser),
};
