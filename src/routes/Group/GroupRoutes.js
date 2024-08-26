const GroupRouter = require("express").Router();
const { authorizeRequest } = require("../../middlewares/AuthorizeRequest");
const {
  getAllGroups,
  getAllGroupsOwnedByUser,
  getAllGroupsJoinedByUser,
  getOneGroup,
  getGroupsByKeyword,
  addOneGroup,
  updateGroupById,
  joinGroupById,
  leaveGroupById,
  deleteOneGroupById,
} = require("../../controllers/Group/GroupController");

GroupRouter.get("/all", authorizeRequest, getAllGroups);
GroupRouter.get("/get-own-groups", authorizeRequest, getAllGroupsOwnedByUser);
GroupRouter.get(
  "/get-joined-groups",
  authorizeRequest,
  getAllGroupsJoinedByUser
);
GroupRouter.get("/find/:id", authorizeRequest, getOneGroup);
GroupRouter.get("/search/:keyword", authorizeRequest, getGroupsByKeyword);
GroupRouter.post("/add", authorizeRequest, addOneGroup);
GroupRouter.patch("/update/:id", authorizeRequest, updateGroupById);
GroupRouter.patch("/join/:id", authorizeRequest, joinGroupById);
GroupRouter.patch("/leave/:id", authorizeRequest, leaveGroupById);
GroupRouter.delete("/delete/:id", authorizeRequest, deleteOneGroupById);

module.exports = GroupRouter;
