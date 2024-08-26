const Group = require("../../models/Group/GroupModel");
const { logger } = require("../../services/logHandlers/HandleWinston");
const {
  sendResponse,
} = require("../../services/responseHandlers/HandleResponse");
const { asyncHandler } = require("../../middlewares/AsyncHandler");
const GroupChatMessage = require("../../models/Chat/GroupChatModel");

//get all group chat by user with last message
const getAllGroupsJoinedByUserWithLastMessage = async (req, res) => {
  //get userId from auth middleware
  const userId = req?.auth?._id;
  //check if userId is provided
  if (!userId) {
    return sendResponse(res, 400, "userId is required in request");
  }
  //perform query on database
  const groups = await Group.getAllGroupsJoinedByUser(userId);
  //fine the last message of these groups from group chat message
  const updatedGroups = await Promise.all(
    groups?.map(async (group) => {
      const lastMessage = await GroupChatMessage.getLastMessageOfGroup(
        group?._id
      );
      let { message, attachment, createdAt } = lastMessage || {};
      message = message || "";
      attachment = attachment || "";
      createdAt = createdAt || null;
      return { ...group, message, attachment, createdAt };
    })
  );
  //now sort the groups by last message
  updatedGroups.sort((a, b) => {
    return new Date(b?.createdAt) - new Date(a?.createdAt);
  });
  //log and send response
  logger.log("info", `Found ${groups?.length} groups for user ${userId}`);
  return sendResponse(
    res,
    200,
    "Fetched all groups joined by user with last message",
    updatedGroups
  );
};

//get all chats by group
const getAllChatsByGroupId = async (req, res) => {
  //get page number and limit from query
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 50;
  //get groupId from params
  const groupId = req?.params?.groupId;
  //check if groupId is provided
  if (!groupId) {
    return sendResponse(res, 400, "Group ID is required in params");
  }
  //prepare data for query
  const updatedData = { groupId, page, limit };
  //perform query on database
  const chats = await GroupChatMessage.getAllChatsByGroupId(updatedData);
  logger.log("info", `Found ${chats?.length} chats for ${groupId} group`);
  return sendResponse(res, 200, "Fetched all chats for this group", chats);
};

module.exports = {
  getAllGroupsJoinedByUserWithLastMessage: asyncHandler(
    getAllGroupsJoinedByUserWithLastMessage
  ),
  getAllChatsByGroupId: asyncHandler(getAllChatsByGroupId),
};
