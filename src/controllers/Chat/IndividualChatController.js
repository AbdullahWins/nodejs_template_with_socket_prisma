const { logger } = require("../../services/logHandlers/HandleWinston");
const {
  sendResponse,
} = require("../../services/responseHandlers/HandleResponse");
const { asyncHandler } = require("../../middlewares/AsyncHandler");
const IndividualChatMessage = require("../../models/Chat/IndividualChatModel");

//get users whom the user has chatted with
const getIndivualChattedUsers = async (req, res) => {
  const userId = req?.auth?._id;
  if (!userId) {
    return sendResponse(res, 401, "Unauthorized");
  }
  // Perform query on database
  const users = await IndividualChatMessage.getIndivualChattedUsers(userId);
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
const getAllIndividualChatsBetweenTwoUser = async (req, res) => {
  //get page number and limit from query
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 50;

  //get receiverId from params
  const otherUserId = req?.params?.receiverId;
  const userId = req?.auth?._id;

  //check if receiverId is provided
  if (!userId || !otherUserId) {
    return sendResponse(res, 400, "Receiver ID is required in params");
  }
  //prepare data for query
  const updatedData = { userId, otherUserId, page, limit };
  //perform query on database
  const chats = await IndividualChatMessage.getAllIndividualChatsBetweenTwoUser(
    updatedData
  );
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

module.exports = {
  getIndivualChattedUsers: asyncHandler(getIndivualChattedUsers),
  getAllIndividualChatsBetweenTwoUser: asyncHandler(
    getAllIndividualChatsBetweenTwoUser
  ),
};
