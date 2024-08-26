// group model
const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const { GroupDTO } = require("../../dtos/GroupDTO");
const User = require("../User/UserModel");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");
const {
  handleGroupJoinNotification,
  handleGroupLeaveNotification,
} = require("../../chats/NotificationModule");

const groupSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  description: {
    type: String,
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },

  createdAt: {
    type: Number,
    default: () => Timekoto(),
  },
});

//get all groups with user populated and filtered with dto
groupSchema.statics.getAllGroups = async function (userId) {
  try {
    // Find all groups and populate the userId field while excluding the password field
    const groups = await this.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "owner",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "members",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      });

    if (groups?.length === 0) {
      throw new CustomError(404, "No groups found");
    }

    //remove own groups from the list
    let filteredGroups = groups.filter(
      (group) => group?.owner?._id.toString() !== userId?.toString()
    );

    //show only public privacy groups and show friends privacy only if the user is a friend of the owner of the group
    // filteredGroups = filteredGroups.filter((group) => {
    //   if (group.privacy === "public") {
    //     return true;
    //   } else if (group.privacy === "friends") {
    //     return group?.owner?.friends?.some(
    //       (friend) => friend?._id.toString() === userId?.toString()
    //     );
    //   }
    // });

    //add a value to show if the user has joined the event and another value to show how many people have joined the event
    filteredGroups.forEach((group) => {
      group.isJoined = group?.members?.some(
        (member) => member?._id.toString() === userId?.toString()
      );
      group.memberCount = group?.members?.length || 0;
    });

    // Transform user objects into DTO format for each group
    const transformedGroups = filteredGroups.map((group) => {
      const groupDTO = new GroupDTO(group);
      return groupDTO;
    });

    // Return transformed groups
    return transformedGroups;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get all groups by user with user and group populated and filtered with dto
groupSchema.statics.getAllGroupsOwnedByUser = async function (userId) {
  try {
    // Find all groups by user and populate the userId field while excluding the password field
    const groups = await this.find({ owner: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "owner",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "members",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      });

    if (groups?.length === 0) {
      throw new CustomError(404, "No groups found for this user");
    }

    //add a value to show if the user has joined the event and another value to show how many people have joined the event
    groups.forEach((group) => {
      group.isJoined = group?.members?.some(
        (member) => member?._id.toString() === userId?.toString()
      );
      group.memberCount = group?.members?.length || 0;
    });

    // Transform user objects into DTO format for each group
    const transformedGroups = groups.map((group) => {
      const groupDTO = new GroupDTO(group);
      return groupDTO;
    });

    // Return transformed groups
    return transformedGroups;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get all group joined by the user
groupSchema.statics.getAllGroupsJoinedByUser = async function (userId) {
  try {
    // Find all groups by user and populate the userId field while excluding the password field
    const groups = await this.find({ members: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "owner",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "members",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      });

    if (groups?.length === 0) {
      throw new CustomError(404, "No groups found for this user");
    }

    //add a value to show if the user has joined the event and another value to show how many people have joined the event
    groups.forEach((group) => {
      group.isJoined = group?.members?.some(
        (member) => member?._id.toString() === userId?.toString()
      );
      group.memberCount = group?.members?.length || 0;
    });

    // Transform user objects into DTO format for each group
    const transformedGroups = groups.map((group) => {
      const groupDTO = new GroupDTO(group);
      return groupDTO;
    });

    // Return transformed groups
    return transformedGroups;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get one group with user and group populated and filtered with dto
groupSchema.statics.getOneGroup = async function ({ userId, groupId }) {
  try {
    // Find one group and populate the userId field while excluding the password field
    const group = await this.findById(groupId)
      .populate({
        path: "owner",
        // model: "User",
        select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "members",
        // model: "User",
        select: "-password",
        options: { lean: true },
      });

    if (!group) {
      throw new CustomError(404, "No group found");
    }

    //add a value to show if the user has joined the event and another value to show how many people have joined the event
    group.isJoined = group?.members?.some(
      (member) => member?._id.toString() === userId?.toString()
    );
    group.memberCount = group?.members?.length || 0;

    // Transform user object into DTO format
    const groupDTO = new GroupDTO(group);

    // Return transformed group
    return groupDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get groups by keyword partial match
groupSchema.statics.getGroupsByKeyword = async function ({ keyword, userId }) {
  try {
    if (keyword === "all") {
      return this.getAllGroups();
    }
    const regex = new RegExp(keyword, "i"); // case-insensitive regex
    const groups = await this.find({
      $or: [{ name: { $regex: regex } }],
    })
      .populate({
        path: "owner",
        // model: "User",
        select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "members",
        // model: "User",
        select: "-password",
        options: { lean: true },
      })
      .exec();

    //remove own groups from the list
    const filteredGroups = groups.filter(
      (group) => group?.owner?._id.toString() !== userId?.toString()
    );

    //add a value to show if the user has joined the event and another value to show how many people have joined the event
    filteredGroups.forEach((group) => {
      group.isJoined = group?.members?.some(
        (member) => member?._id.toString() === userId?.toString()
      );
      group.memberCount = group?.members?.length || 0;
    });

    // Transform user objects into DTO format for each group
    const transformedGroups = filteredGroups.map((group) => {
      const groupDTO = new GroupDTO(group);
      return groupDTO;
    });

    // Return transformed groups
    return transformedGroups;
  } catch (error) {
    throw new CustomError(error?.statusCode || 500, error?.message);
  }
};

//add new group with user and group populated and dto
groupSchema.statics.addOneGroup = async function (data) {
  try {
    const { owner, name, coverImage, description } = data;
    // Add owner to the group member by default
    const members = [owner];
    // Save the group
    const group = new this({
      owner,
      name,
      coverImage,
      description,
      members,
    });

    // Save group
    const result = await group.save();

    if (!result) {
      throw new CustomError(500, "Failed to add group");
    }

    //find and populate the data
    const newGroup = await this.findById(result?._id)
      .populate({
        path: "owner",
        // model: "User",
        select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "members",
        // model: "User",
        select: "-password",
        options: { lean: true },
      });

    // Transform group object into DTO format
    const groupDTO = new GroupDTO(newGroup);
    // Return transformed group
    return groupDTO;
  } catch (error) {
    console.log("error", error);
    throw new CustomError(
      error?.statusCode || 500,
      error?.message || "An error occurred"
    );
  }
};

//update group with user and group populated and dto
groupSchema.statics.updateGroupById = async function ({
  groupId,
  updatedData,
}) {
  try {
    //check if the value of status is valid
    // if (!ENUM_JOB_STATUS[status]) {
    //   throw new CustomError(400, "Invalid status value");
    // }
    const updatedGroup = await this.findByIdAndUpdate(
      groupId,
      { ...updatedData },
      { new: true }
    )
      .populate({
        path: "owner",
        // model: "User",
        select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "members",
        // model: "User",
        select: "-password",
        options: { lean: true },
      });

    //process group using dto
    if (!updatedGroup) {
      throw new CustomError(404, "No group found");
    }

    // Transform group object into DTO format
    const groupDTO = new GroupDTO(updatedGroup);
    return groupDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//join group with user and group populated and dto
groupSchema.statics.joinGroupById = async function ({ groupId, userId }) {
  try {
    // Find the group by its ID
    const group = await this.findById(groupId).lean();

    if (!group) {
      throw new CustomError(404, "No group found");
    }

    //check if user is already a member of the group (usaerid is string, array of members is onjectid)
    if (group.members.toString().includes(userId)) {
      throw new CustomError(400, "User is already a member of the group");
    }

    // Add user to the group only if the user is not already a member
    group.members.push(userId);

    // Update the group with the new member
    const updatedGroup = await this.findByIdAndUpdate(
      groupId,
      { members: group.members },
      { new: true }
    ).lean();

    if (!updatedGroup) {
      throw new CustomError(500, "Failed to join group");
    }

    //emit the friend request notification to the receiver
    const joiner = await User.findById(userId).lean();
    const dataForNotification = {
      senderId: userId,
      senderName: joiner?.fullName,
      senderImage: joiner?.profileImage,
      receiverId: group?.owner?._id?.toString(),
      entityId: group?._id?.toString(),
      entityType: "group",
    };

    handleGroupJoinNotification(dataForNotification);

    // Return the updated group
    return updatedGroup;
  } catch (error) {
    throw new CustomError(error?.statusCode || 500, error?.message);
  }
};

//leave group with user and group populated and dto
groupSchema.statics.leaveGroupById = async function ({ groupId, userId }) {
  try {
    // Find the group by its ID
    const group = await this.findById(groupId).lean();

    if (!group) {
      throw new CustomError(404, "No group found");
    }

    //check if user is a member of the group (usaerid is string, array of members is onjectid)
    if (!group.members.toString().includes(userId)) {
      throw new CustomError(400, "User is not a member of the group");
    }

    // Remove user from the group only if the user is a member
    group.members = group.members.filter(
      (member) => member.toString() !== userId.toString()
    );

    // Update the group with the new member
    const updatedGroup = await this.findByIdAndUpdate(
      groupId,
      { members: group.members },
      { new: true }
    ).lean();

    if (!updatedGroup) {
      throw new CustomError(500, "Failed to leave group");
    }

    //emit the friend request notification to the receiver
    const left = await User.findById(userId).lean();
    const dataForNotification = {
      senderId: userId,
      senderName: left?.fullName,
      senderImage: left?.profileImage,
      receiverId: group?.owner?._id?.toString(),
      entityId: group?._id?.toString(),
      entityType: "group",
    };

    handleGroupLeaveNotification(dataForNotification);
    // Return the updated group
    return updatedGroup;
  } catch (error) {
    throw new CustomError(error?.statusCode || 500, error?.message);
  }
};

//delete one group
groupSchema.statics.deleteOneGroup = async function (groupId) {
  try {
    //to perform multiple filters at once
    const filter = {
      _id: groupId,
    };

    const result = await this.deleteOne(filter);
    if (result?.deletedCount === 0) {
      throw new CustomError(404, "No group found");
    }
    return { message: `Group deleted successfully with id: ${groupId}` };
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
