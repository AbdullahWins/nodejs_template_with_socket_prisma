// DTOs/UserDTO.js

class UserLoginDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.email = user?.email || "";
    this.fullName = user?.fullName || "";
    this.birthDay = user?.birthDay || "";
    this.gender = user?.gender || "";
    this.bio = user?.bio || "";
    this.hometown = user?.hometown || "";
    this.currentTown = user?.currentTown || "";
    this.currentLocation = user?.currentLocation || {};
    this.yearsOfMoving = user?.yearsOfMoving || "";
    this.occupation = user?.occupation || "";
    this.profileImage = user?.profileImage || "";
    this.coverImage = user?.coverImage || "";
    this.hobbyList = user?.hobbyList || [];
    this.friendsList = user?.friendsList?.map((friend) => ({
      userId: new UserFriendlistDTO(friend?.userId),
      status: friend?.status,
    }));
  }
}

class UserRegisterDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.email = user?.email || "";
    this.fullName = user?.fullName || "";
    this.birthDay = user?.birthDay || "";
    this.gender = user?.gender || "";
    this.bio = user?.bio || "";
    this.hometown = user?.hometown || "";
    this.currentTown = user?.currentTown || "";
    this.currentLocation = user?.currentLocation || {};
    this.yearsOfMoving = user?.yearsOfMoving || "";
    this.occupation = user?.occupation || "";
    this.profileImage = user?.profileImage || "";
    this.coverImage = user?.coverImage || "";
    this.hobbyList = user?.hobbyList || [];
    this.friendsList = user?.friendsList?.map((friend) => ({
      ...new UserFriendlistDTO(friend?.userId),
      status: friend?.status,
    }));
  }
}

class UserFetchDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.email = user?.email || "";
    this.fullName = user?.fullName || "";
    this.birthDay = user?.birthDay || "";
    this.gender = user?.gender || "";
    this.bio = user?.bio || "";
    this.hometown = user?.hometown || "";
    this.currentTown = user?.currentTown || "";
    this.currentLocation = user?.currentLocation || {};
    this.yearsOfMoving = user?.yearsOfMoving || "";
    this.occupation = user?.occupation || "";
    this.profileImage = user?.profileImage || "";
    this.coverImage = user?.coverImage || "";
    this.hobbyList = user?.hobbyList || [];
    this.friendsList = user?.friendsList?.map((friend) => ({
      ...new UserFriendlistDTO(friend?.userId),
      status: friend?.status,
    }));
  }
}

class UserFetchWithFriendshipStatusDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.email = user?.email || "";
    this.fullName = user?.fullName || "";
    this.birthDay = user?.birthDay || "";
    this.gender = user?.gender || "";
    this.bio = user?.bio || "";
    this.hometown = user?.hometown || "";
    this.currentTown = user?.currentTown || "";
    this.currentLocation = user?.currentLocation || {};
    this.yearsOfMoving = user?.yearsOfMoving || "";
    this.occupation = user?.occupation || "";
    this.profileImage = user?.profileImage || "";
    this.coverImage = user?.coverImage || "";
    this.hobbyList = user?.hobbyList || [];
    this.friendsList = user?.friendsList?.map((friend) => ({
      ...new UserFriendlistDTO(friend?.userId),
      status: friend?.status,
    }));
    this.friendshipStatus = user?.friendshipStatus || null;
  }
}

class UserUpdateDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.email = user?.email || "";
    this.fullName = user?.fullName || "";
    this.birthDay = user?.birthDay || "";
    this.gender = user?.gender || "";
    this.bio = user?.bio || "";
    this.hometown = user?.hometown || "";
    this.currentTown = user?.currentTown || "";
    this.currentLocation = user?.currentLocation || {};
    this.yearsOfMoving = user?.yearsOfMoving || "";
    this.occupation = user?.occupation || "";
    this.profileImage = user?.profileImage || "";
    this.coverImage = user?.coverImage || "";
    this.hobbyList = user?.hobbyList || [];
    this.friendsList = user?.friendsList?.map((friend) => ({
      ...new UserFriendlistDTO(friend?.userId),
      status: friend?.status,
    }));
  }
}

class UserDeleteDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.fullName = user?.fullName || "";
    this.email = user?.email || "";
  }
}

//friendlist
class UserFriendlistDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.fullName = user?.fullName || "";
    this.gender = user?.gender || "";
    this.hobbyList = user?.hobbyList || [];
    this.profileImage = user?.profileImage || "";
    this.coverImage = user?.coverImage || "";
    this.currentTown = user?.currentTown || "";
  }
}

//post
class UserPostDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.fullName = user?.fullName || "";
    // this.gender = user?.gender || "";
    this.profileImage = user?.profileImage || "";
    this.currentTown = user?.currentTown || "";
  }
}

//job
class UserJobDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.fullName = user?.fullName || "";
    // this.gender = user?.gender || "";
    this.profileImage = user?.profileImage || "";
    this.currentTown = user?.currentTown || "";
  }
}

//group
class UserGroupDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.fullName = user?.fullName || "";
    // this.gender = user?.gender || "";
    this.profileImage = user?.profileImage || "";
    this.currentTown = user?.currentTown || "";
  }
}

//event
class UserEventDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.fullName = user?.fullName || "";
    // this.gender = user?.gender || "";
    this.profileImage = user?.profileImage || "";
    this.currentTown = user?.currentTown || "";
  }
}
//event
class UserClubDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.fullName = user?.fullName || "";
    // this.gender = user?.gender || "";
    this.profileImage = user?.profileImage || "";
    this.currentTown = user?.currentTown || "";
  }
}

//chat
class UserChatDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.fullName = user?.fullName || "";
    // this.gender = user?.gender || "";
    this.profileImage = user?.profileImage || "";
    this.currentTown = user?.currentTown || "";
  }
}

//chat
class UserMeetingDTO {
  constructor(user) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.fullName = user?.fullName || "";
    // this.gender = user?.gender || "";
    this.profileImage = user?.profileImage || "";
    this.currentTown = user?.currentTown || "";
  }
}

//last chat
class UserLastChatDTO {
  constructor(user, lastMessage) {
    this._id = user?._id || null;
    this.username = user?.username || "";
    this.fullName = user?.fullName || "";
    this.profileImage = user?.profileImage || "";
    this.currentTown = user?.currentTown || "";
    this.message = lastMessage?.message || "";
    this.attachment = lastMessage?.attachment || "";
    this.isMine = lastMessage?.sender._id.equals(user._id) || false;
    this.createdAt = lastMessage?.createdAt || null;
  }
}

module.exports = {
  UserLoginDTO,
  UserRegisterDTO,
  UserFetchDTO,
  UserFetchWithFriendshipStatusDTO,
  UserUpdateDTO,
  UserDeleteDTO,
  UserFriendlistDTO,
  UserPostDTO,
  UserJobDTO,
  UserGroupDTO,
  UserEventDTO,
  UserClubDTO,
  UserChatDTO,
  UserMeetingDTO,
  UserLastChatDTO,
};
