// Controllers/GroupController.js
const { logger } = require("../../services/logHandlers/HandleWinston");
const Group = require("../../models/Group/GroupModel");
const {
  ObjectIdChecker,
} = require("../../services/validationHandlers/ObjectIdChecker");
const {
  sendResponse,
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");
const { asyncHandler } = require("../../middlewares/AsyncHandler");
const {
  handleFileUpload,
} = require("../../services/fileHandlers/HandleFileUpload");

//get all Group using mongoose
const getAllGroups = async (req, res) => {
  //get userId from middleware authentication
  const userId = req?.auth?._id;
  //perform query on database
  const groups = await Group.getAllGroups(userId);
  logger.log("info", `Found ${groups?.length} groups`);
  return sendResponse(res, 200, "Fetched all groups", groups);
};

//get single Group using mongoose
const getOneGroup = async (req, res) => {
  //get userId from middleware authentication
  const userId = req?.auth?._id;
  const groupId = req?.params?.id;
  //object id validation
  if (!ObjectIdChecker(groupId)) {
    throw new CustomError(400, "Invalid ObjectId");
  }

  //perform query on database
  const group = await Group.getOneGroup({ userId, groupId });
  logger.log("info", JSON.stringify(group, null, 2));
  return sendResponse(res, 200, "Group retrieved successfully", group);
};

//get groups by keyword using mongoose
const getGroupsByKeyword = async (req, res) => {
  const keyword = req?.params?.keyword;
  const userId = req?.auth?._id;
  if (!keyword) {
    return sendResponse(
      res,
      400,
      `keyword is needed on params, use "all" for all groups without any filter!`
    );
  }
  const groups = await Group.getGroupsByKeyword({keyword, userId});
  if (!groups?.length) {
    return sendResponse(res, 404, "No groups found based on keyword", groups);
  }
  return sendResponse(
    res,
    200,
    "Groups retrieved successfully based on keyword",
    groups
  );
};

//get all Group by user using mongoose
const getAllGroupsOwnedByUser = async (req, res) => {
  const userId = req?.auth?._id;
  if (!userId) {
    throw new CustomError(401, "Unauthorized");
  }

  //perform query on database
  const groups = await Group.getAllGroupsOwnedByUser(userId);
  logger.log("info", `Found ${groups?.length} groups`);
  return sendResponse(res, 200, "Fetched all groups", groups);
};

//get all group joined by the user
const getAllGroupsJoinedByUser = async (req, res) => {
  const userId = req?.auth?._id;
  if (!userId) {
    throw new CustomError(401, "Unauthorized");
  }
  //perform query on database
  const groups = await Group.getAllGroupsJoinedByUser(userId);
  logger.log("info", `Found ${groups?.length} groups`);
  return sendResponse(res, 200, "Fetched all groups", groups);
};

//add new Group using mongoose
const addOneGroup = async (req, res) => {
  const { name, description } = JSON.parse(req?.body?.data);
  const { files } = req;
  if (!name || !description) {
    throw new CustomError(400, "name and description needed");
  }

  //validate authority from middleware authentication
  const ownerId = req?.auth?._id;
  if (!ownerId) {
    throw new CustomError(401, "Unauthorized");
  }

  let updatedData = { owner: ownerId, name, description };
  const folderName = "groups";
  if (files?.single) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.single,
      folderName,
    });
    const coverImage = fileUrls[0];
    updatedData = { ...updatedData, coverImage };
  }

  //add new group
  const result = await Group.addOneGroup(updatedData);
  logger.log("info", `Created a group: ${JSON.stringify(result, null, 2)}`);
  return sendResponse(res, 201, "Group created successfully", result);
};

// update One group content by id using mongoose
const updateGroupById = async (req, res) => {
  const groupId = req?.params?.id;
  const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
  const { files } = req;

  //object id validation
  if (!ObjectIdChecker(groupId)) {
    throw new CustomError(400, "Invalid ObjectId");
  }

  if (!data) {
    throw new CustomError(400, "Missing required fields");
  }

  //update group
  let updatedData = { ...data };
  const folderName = "groups";
  if (files?.single) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.single,
      folderName,
    });
    const coverImage = fileUrls[0];
    updatedData = { ...updatedData, coverImage };
  }
  const result = await Group.updateGroupById({ groupId, updatedData });

  logger.log("info", `Updated group: ${JSON.stringify(result, null, 2)}`);
  return sendResponse(res, 200, "Group updated successfully", result);
};

//join group by id
const joinGroupById = async (req, res) => {
  const groupId = req?.params?.id;
  const userId = req?.auth?._id;

  //object id validation
  if (!ObjectIdChecker(groupId)) {
    throw new CustomError(400, "Invalid ObjectId");
  }

  //join group
  const result = await Group.joinGroupById({ groupId, userId });
  logger.log("info", `Joined group: ${JSON.stringify(result, null, 2)}`);
  return sendResponse(res, 200, "Group joined successfully", result);
};

//leave group by id
const leaveGroupById = async (req, res) => {
  const groupId = req?.params?.id;
  const userId = req?.auth?._id;

  //object id validation
  if (!ObjectIdChecker(groupId)) {
    throw new CustomError(400, "Invalid ObjectId");
  }

  //leave group
  const result = await Group.leaveGroupById({ groupId, userId });
  logger.log("info", `Left group: ${JSON.stringify(result, null, 2)}`);
  return sendResponse(res, 200, "Group left successfully", result);
};

//delete one group
const deleteOneGroupById = async (req, res) => {
  const groupId = req?.params?.id;
  //object id validation
  if (!ObjectIdChecker(groupId)) {
    throw new CustomError(400, "Invalid ObjectId");
  }

  //delete group
  const deletionResult = await Group.deleteOneGroup(groupId);
  logger.log("info", deletionResult?.message);
  return sendResponse(res, 200, deletionResult?.message);
};

module.exports = {
  getAllGroups: asyncHandler(getAllGroups),
  getAllGroupsOwnedByUser: asyncHandler(getAllGroupsOwnedByUser),
  getAllGroupsJoinedByUser: asyncHandler(getAllGroupsJoinedByUser),
  getOneGroup: asyncHandler(getOneGroup),
  getGroupsByKeyword: asyncHandler(getGroupsByKeyword),
  addOneGroup: asyncHandler(addOneGroup),
  updateGroupById: asyncHandler(updateGroupById),
  joinGroupById: asyncHandler(joinGroupById),
  leaveGroupById: asyncHandler(leaveGroupById),
  deleteOneGroupById: asyncHandler(deleteOneGroupById),
};
