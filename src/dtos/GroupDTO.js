//Group DTO
const { UserGroupDTO } = require("./UserDTO");

class GroupDTO {
  constructor(group) {
    this._id = group?._id || null;
    this.owner = group?.owner ? new UserGroupDTO(group.owner) : null;
    this.name = group?.name || "";
    this.coverImage = group?.coverImage || "";
    this.description = group?.description || "";
    this.members = group.members.map((member) => new UserGroupDTO(member));
    this.isJoined = group?.isJoined || false;
    this.memberCount = group?.memberCount || 0;
    this.createdAt = group?.createdAt || null;
  }
}

class GroupGetDTO {
  constructor(group) {
    this._id = group?._id || null;
    this.owner = group?.owner ? new UserGroupDTO(group.owner) : null;
    this.name = group?.name || "";
    this.coverImage = group?.coverImage || "";
    this.description = group?.description || "";
    this.members = group.members.map((member) => new UserGroupDTO(member));
    this.createdAt = group?.createdAt || null;
  }
}

module.exports = { GroupDTO, GroupGetDTO };
