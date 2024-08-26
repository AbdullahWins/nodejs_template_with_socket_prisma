// models/UserModel.js

const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const {
  UserLoginDTO,
  UserRegisterDTO,
  UserUpdateDTO,
  UserFetchDTO,
  UserFriendlistDTO,
  UserFetchWithFriendshipStatusDTO,
} = require("../../dtos/UserDTO");
const { generateToken } = require("../../services/tokenHandlers/HandleJwt");
const { validateOTP } = require("../../services/otpHandlers/HandleOTP");
const {
  hashPassword,
  comparePasswords,
} = require("../../services/encryptionHandlers/HandleBcrypt");
const { friendsListSchema, locationSchema } = require("./UserSubschemas");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");
const { ENUM_USER_PROVIDER } = require("../../constants/UserConstants");
const {
  handleFriendRequestNotification,
  handleAcceptedFriendRequestNotification,
} = require("../../chats/NotificationModule");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true,
    default: () => {
      return `user-${Timekoto()}`;
    },
    minlength: [5, "Username must be at least 5 characters long"],
    // required: [true, "Username is required"],
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    validate: {
      validator: (value) => {
        //validate email format
        return /\S+@\S+\.\S+/.test(value);
      },
      message: (props) => `${props?.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    // required: [true, "Password is required"],
    validate: {
      validator: (value) => {
        //validate password length
        return value.length >= 6;
      },
      message: "Password must be at least 6 characters long",
    },
  },
  provider: {
    type: String,
    required: true,
    default: "local",
    enum: ENUM_USER_PROVIDER,
  },
  providerId: {
    type: String,
    default: "",
  },
  fullName: {
    type: String,
    default: "",
  },
  birthDay: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  hometown: {
    type: String,
    default: "",
  },
  currentTown: {
    type: String,
    default: "",
  },
  //location
  currentLocation: {
    type: locationSchema,
    default: { type: "Point", coordinates: [0.0, 0.0] },
  },
  yearsOfMoving: {
    type: String,
    default: "",
  },
  occupation: {
    type: String,
    default: "",
  },
  profileImage: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  coverImage: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  hobbyList: {
    type: [String],
    default: [],
  },
  friendsList: {
    type: [friendsListSchema],
    default: [],
  },
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
  updatedAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

//indexing the coordinates for geospatial queries
userSchema.index({ "currentLocation.coordinates": "2dsphere" });

//get all users from the database
userSchema.statics.getAllUsers = async function () {
  try {
    const users = await this.find()
      .populate("friendsList.userId")
      .sort({ createdAt: -1 })
      .exec();

    // Transform users with DTO
    const usersDTO = users.map((user) => new UserFetchDTO(user));
    return usersDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode || 500, error?.message);
  }
};

//get one user
userSchema.statics.getOneUser = async function ({ id }) {
  try {
    const user = await this.findOne({ _id: id })
      .populate("friendsList.userId")
      .exec();
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    //filter if populated friendsList.userId _id is null
    user.friendsList = user.friendsList.filter((friend) => friend?.userId);

    //filter only accepted friends
    user.friendsList = user.friendsList.filter(
      (friend) => friend?.status === "accepted"
    );

    const userDTO = new UserFetchDTO(user);
    return userDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get user by keyword partial match
userSchema.statics.getUserByKeyword = async function ({ keyword, userId }) {
  try {
    if (keyword === "all") {
      return this.getAllUsers();
    }
    const regex = new RegExp(keyword, "i"); // case-insensitive regex
    let users = await this.find({
      $or: [
        { username: { $regex: regex } },
        { fullName: { $regex: regex } },
        { email: { $regex: regex } },
        { hometown: { $regex: regex } },
        { currentTown: { $regex: regex } },
        { occupation: { $regex: regex } },
        { bio: { $regex: regex } },
        { gender: { $regex: regex } },
        { hobbyList: { $in: [regex] } },
      ],
    })
      .populate("friendsList.userId")
      .exec();

    //remove own user from the list
    users = users.filter(
      (user) => user?._id?.toString() !== userId?.toString()
    );

    //get the friend list of the provided userId with statuses
    const user = await this.findOne({ _id: userId }).exec();
    const myFriendsList = user?.friendsList.reduce((acc, friend) => {
      acc[friend?.userId?.toString()] = friend?.status;
      return acc;
    }, {});

    //add friendship status to each user
    users.forEach((user) => {
      user.friendshipStatus = myFriendsList[user?._id?.toString()] || null;
    });

    //transform users with DTO
    const usersDTO = users.map(
      (user) => new UserFetchWithFriendshipStatusDTO(user)
    );
    return usersDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode || 500, error?.message);
  }
};

//get user by username or full name partial match
userSchema.statics.getUserByName = async function (keyword) {
  try {
    const regex = new RegExp(keyword, "i"); // case-insensitive regex
    const users = await this.find({
      $or: [{ username: { $regex: regex } }, { fullName: { $regex: regex } }],
    })
      .populate("friendsList.userId")
      .exec();
    // Transform users with DTO
    const usersDTO = users.map((user) => new UserFetchDTO(user));
    return usersDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode || 500, error?.message);
  }
};

// static method for login
userSchema.statics.login = async function ({ email, password }) {
  try {
    //make the email case insensitive using regex
    email = new RegExp(`^${email}$`, "i");
    //match email to email or username
    const user = await this.findOne({ $or: [{ email }, { username: email }] })
      .populate("friendsList.userId")
      .exec();
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    const passwordMatch = await comparePasswords(password, user?.password);
    if (!passwordMatch) {
      throw new CustomError(401, "Invalid password");
    }

    //filter if populated friendsList.userId _id is null
    user.friendsList = user.friendsList.filter((friend) => friend?.userId);

    //filter only accepted friends
    user.friendsList = user.friendsList.filter(
      (friend) => friend?.status === "accepted"
    );

    const token = generateToken(user?._id);
    const userDTO = new UserLoginDTO(user);

    const finalResponse = { ...userDTO, accessToken: token };
    return finalResponse;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// static method for registration
// userSchema.statics.register = async function ({ username, email, password }) {
//   try {
//     //check if the user already exists
//     const existingUserCheck = await this.findOne({ email })
//       .populate("friendsList.userId")
//       .exec();
//     if (existingUserCheck) {
//       throw new CustomError(409, "User already exists");
//     }

//     //hash the password
//     const hashedPassword = await hashPassword(password);

//     //create a new User instance
//     const newUser = new this({ username, email, password: hashedPassword });

//     //save the User to the database
//     await newUser.save();

//     //generate token
//     const token = generateToken(newUser?._id);
//     const userDTO = new UserRegisterDTO(newUser);

//     const finalResponse = { ...userDTO, accessToken: token };
//     return finalResponse;
//   } catch (error) {
//     throw new CustomError(error?.statusCode, error?.message);
//   }
// };

// static method for registration
userSchema.statics.register = async function (data) {
  try {
    //extract emil and password from data
    const { email, password, ...additionalData } = data;
    //check if the user already exists
    const existingUserCheck = await this.findOne({ email })
      .populate("friendsList.userId")
      .exec();
    if (existingUserCheck) {
      throw new CustomError(409, "User already exists");
    }

    //hash the password
    const hashedPassword = await hashPassword(password);

    //create a new User instance
    const newUser = new this({
      ...additionalData,
      email: email,
      password: hashedPassword,
    });

    //save the User to the database
    await newUser.save();

    //generate token
    const token = generateToken(newUser?._id);
    const userDTO = new UserRegisterDTO(newUser);

    const finalResponse = { ...userDTO, accessToken: token };
    return finalResponse;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//login or register using provider
userSchema.statics.loginOrRegisterProvider = async function ({
  id,
  email,
  photoUrl,
  provider,
  displayName,
}) {
  try {
    //check if the user already exists
    const existingUser = await this.findOne({ email })
      .populate("friendsList.userId")
      .exec();
    if (existingUser?.provider === "local") {
      throw new CustomError(409, "Use email and password to log in");
    }
    if (existingUser && existingUser?.provider === provider) {
      //generate token
      const token = generateToken(existingUser?._id);
      const userDTO = new UserLoginDTO(existingUser);

      const finalResponse = { ...userDTO, accessToken: token };
      return finalResponse;
    } else if (existingUser && existingUser?.provider !== provider) {
      throw new CustomError(409, "User already exists with different provider");
    }

    //create a new User instance
    const newUser = new this({
      providerId: id,
      email: email,
      profileImage: photoUrl,
      fullName: displayName,
      provider: provider,
    });

    //save the User to the database
    await newUser.save();

    //generate token
    const token = generateToken(newUser?._id);
    const userDTO = new UserRegisterDTO(newUser);

    const finalResponse = { ...userDTO, accessToken: token };
    return finalResponse;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//check if the username or email already taken by another user
userSchema.statics.checkUsernameOrEmail = async function ({ username, email }) {
  try {
    //make the email case insensitive using regex
    email = new RegExp(`^${email}$`, "i");
    username = new RegExp(`^${username}$`, "i");

    //check if the email or username already exists
    const userByEmail = await this.findOne({ email: email }).exec();
    const userByUsername = await this.findOne({ username: username }).exec();

    //if both email and username are taken
    if (userByEmail && userByUsername) {
      throw new CustomError(409, "Username and email are already taken");
    }
    //if only email is taken
    if (userByEmail) {
      throw new CustomError(
        409,
        "Email is already taken, username is available"
      );
    }
    //if only username is taken
    if (userByUsername) {
      throw new CustomError(
        409,
        "Username is already taken, email is available"
      );
    }
    //if both email and username are available
    return { message: "Username and email are available" };
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for updating user data
userSchema.statics.updateUserById = async function ({ id, updatedData }) {
  try {
    const updatedUser = await this.findOneAndUpdate(
      { _id: id },
      { $set: updatedData },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      throw new CustomError(404, "User not found");
    }

    //populate friendsList.userId
    await updatedUser.populate("friendsList.userId");

    const userDTO = new UserUpdateDTO(updatedUser);
    return userDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for sending OTP
userSchema.statics.updatePasswordByOTP = async function ({
  email,
  otp,
  newPassword,
}) {
  try {
    // Validate OTP
    const otpStatus = await validateOTP({ email, otp, Model: this });
    if (otpStatus?.error) {
      return { error: otpStatus?.error };
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password
    const updatedUser = await this.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new CustomError(404, "User not found");
    }
    //populate friendsList.userId
    await updatedUser.populate("friendsList.userId");

    const userDTO = new UserUpdateDTO(updatedUser);
    return userDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for updating password by email
userSchema.statics.updatePasswordByEmail = async function ({
  email,
  oldPassword,
  newPassword,
}) {
  try {
    const user = await this.findOne({ email });

    if (!user) {
      throw new CustomError(404, "User not found");
    }

    const passwordMatch = await comparePasswords(oldPassword, user.password);

    if (!passwordMatch) {
      throw new CustomError(401, "Invalid password");
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await this.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true, runValidators: true }
    );

    //populate friendsList.userId
    await updatedUser.populate("friendsList.userId");

    const userDTO = new UserUpdateDTO(updatedUser);
    return userDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

userSchema.statics.deleteUserById = async function (id) {
  try {
    const result = await this.deleteOne({ _id: id });

    if (result?.deletedCount === 0) {
      throw new CustomError(404, "User not found");
    } else {
      return { message: `User deleted successfully with id: ${id}` };
    }
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//friends list operations

// Define the function to suggest friends with similar hobbies
userSchema.statics.suggestFriendsByHobbies = async function ({ userId }) {
  try {
    // Convert userId to string
    userId = userId?.toString();

    const user = await this?.findById(userId)
      .populate("friendsList.userId")
      .exec();
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    // Extract the user's hobby list
    const userHobbies = user?.hobbyList;

    // Find other users with similar hobbies
    const suggestedUsers = await this.find({
      _id: { $ne: userId },
      hobbyList: { $in: userHobbies },
    }).exec();

    // Get list of user's friends' IDs
    const userFriendsIds = user?.friendsList?.map((friend) =>
      friend?.userId?.toString()
    );

    // Filter out users who are already friends, sent, or received with the user
    const filteredSuggestedUsers = suggestedUsers?.filter((suggestedUser) => {
      const isFriend = userFriendsIds?.includes(suggestedUser?._id?.toString());
      if (isFriend) return false;

      // Check if suggestedUser has a friendship status with the user
      const hasFriendshipStatusWithUser = suggestedUser.friendsList.some(
        (friend) => {
          const friendUserId = friend.userId.toString();
          return (
            friendUserId === userId &&
            (friend.status === "accepted" ||
              friend.status === "sent" ||
              friend.status === "received")
          );
        }
      );

      return !hasFriendshipStatusWithUser;
    });

    // Transform the suggested users with DTO
    const suggestedUsersDTO = filteredSuggestedUsers.map(
      (user) => new UserFriendlistDTO(user)
    );

    // Return the list of suggested users
    return suggestedUsersDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode || 500, error?.message);
  }
};

//get suggested friends by current location
userSchema.statics.suggestFriendsByCurrentLocation = async function ({
  userId,
  maxDistance = 9,
}) {
  try {
    userId = userId.toString();
    const user = await this.findOne({ _id: userId })
      .populate("friendsList.userId")
      .exec();

    if (!user) {
      throw new CustomError(404, "User not found");
    }

    const userLocation = user?.currentLocation;

    const suggestedUsers = await this.find({
      _id: { $ne: userId },
      currentLocation: {
        $geoWithin: {
          $centerSphere: [userLocation.coordinates, maxDistance / 6371],
        },
      },
    }).exec();

    // Get list of user's friends' IDs
    const userFriendsIds = user?.friendsList?.map((friend) =>
      friend?.userId?.toString()
    );

    // Filter out users who are already friends, sent, or received with the user
    const filteredSuggestedUsers = suggestedUsers.filter((suggestedUser) => {
      const isFriend = userFriendsIds.includes(suggestedUser?._id?.toString());
      if (isFriend) return false;

      // Check if suggestedUser has a friendship status with the user
      const hasFriendshipStatusWithUser = suggestedUser.friendsList.some(
        (friend) => {
          const friendUserId = friend.userId.toString();
          return (
            friendUserId === userId &&
            (friend.status === "accepted" ||
              friend.status === "sent" ||
              friend.status === "received")
          );
        }
      );

      return !hasFriendshipStatusWithUser;
    });

    const suggestedUsersDTO = filteredSuggestedUsers?.map(
      (user) => new UserFriendlistDTO(user)
    );

    return suggestedUsersDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode || 500, error?.message);
  }
};

//get sent friend requests
userSchema.statics.getReceivedFriendRequests = async function ({ userId }) {
  try {
    //convert userId to string
    userId = userId.toString();

    // Find the user
    const user = await this.findOne({ _id: userId })
      .populate("friendsList.userId")
      .exec();

    // Check if the user exists
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    // Get the sent friend requests
    const sentFriendRequests = user.friendsList.filter(
      (friend) => friend?.status === "received"
    );

    //use DTO to process
    const sentFriendRequestsDTO = sentFriendRequests.map(
      (friend) => new UserFriendlistDTO(friend?.userId)
    );
    if (sentFriendRequestsDTO.length === 0) {
      throw new CustomError(404, "No friend requests found");
    } else {
      // Return the sent friend requests
      return sentFriendRequestsDTO;
    }
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for received friend requests
userSchema.statics.getSentFriendRequests = async function ({ userId }) {
  try {
    //convert userId to string
    userId = userId.toString();

    // Find the user
    const user = await this.findOne({ _id: userId })
      .populate("friendsList.userId")
      .exec();

    // Check if the user exists

    if (!user) {
      throw new CustomError(404, "User not found");
    }

    // Get the received friend requests
    const sentFriendRequests = user.friendsList.filter(
      (friend) => friend?.status === "sent"
    );

    //use DTO to process
    const sentFriendRequestsDTO = sentFriendRequests.map(
      (friend) => new UserFriendlistDTO(friend?.userId)
    );

    if (sentFriendRequestsDTO.length === 0) {
      throw new CustomError(404, "No friend requests found");
    } else {
      // Return the received friend requests
      return sentFriendRequestsDTO;
    }
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for sending friend request
userSchema.statics.sendOneFriendRequest = async function ({
  userId,
  friendId,
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Convert IDs to strings
    userId = userId.toString();
    friendId = friendId.toString();

    // Find the user and friend
    const user = await this.findOne({ _id: userId }).session(session).exec();
    const friend = await this.findOne({ _id: friendId })
      .session(session)
      .exec();

    // Check if user and friend exist
    if (!user) {
      throw new CustomError(404, "User not found");
    }
    if (!friend) {
      throw new CustomError(404, "Friend not found");
    }

    // Check if the user is trying to send a friend request to themselves
    if (userId === friendId) {
      throw new CustomError(
        400,
        "You cannot send a friend request to yourself"
      );
    }

    // Check if the friend request already exists
    const friendRequestExists = user.friendsList.find(
      (friend) => friend?.userId?.toString() === friendId
    );
    const userRequestExists = friend.friendsList.find(
      (friend) => friend?.userId?.toString() === userId
    );

    if (friendRequestExists || userRequestExists) {
      if (
        friendRequestExists?.status === "sent" ||
        userRequestExists?.status === "sent"
      ) {
        throw new CustomError(409, "A friend request already exists");
      }
      throw new CustomError(409, "This user is already a friend");
    }

    // Prepare the friend request
    user.friendsList.push({ userId: friendId, status: "sent" });
    friend.friendsList.push({ userId: userId, status: "received" });

    // Emit the friend request notification
    const dataForNotification = {
      senderId: userId,
      senderName: user?.fullName,
      senderImage: user?.profileImage,
      receiverId: friendId,
      entityId: userId,
      entityType: "user",
    };
    await handleFriendRequestNotification(dataForNotification);

    // Save changes
    await user.save({ session });
    await friend.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return success message
    return { message: "Request sent successfully" };
  } catch (error) {
    // Abort the transaction in case of error
    await session.abortTransaction();
    session.endSession();
    throw new CustomError(
      error?.statusCode || 500,
      error?.message || "Internal Server Error"
    );
  }
};

// Static method for accepting friend request
userSchema.statics.acceptOneFriendRequest = async function ({
  userId,
  friendId,
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Convert IDs to strings
    userId = userId.toString();
    friendId = friendId.toString();

    // Find the user and friend
    const user = await this.findOne({ _id: userId }).session(session).exec();
    const friend = await this.findOne({ _id: friendId })
      .session(session)
      .exec();

    // Check if user and friend exist
    if (!user) {
      throw new CustomError(404, "User not found");
    }
    if (!friend) {
      throw new CustomError(404, "Friend not found");
    }

    // Check if the user is trying to accept a friend request from themselves
    if (userId === friendId) {
      throw new CustomError(
        400,
        "You cannot accept a friend request from yourself"
      );
    }

    // Check if the friend request exists
    const friendRequest = user?.friendsList?.find(
      (friend) => friend?.userId?.toString() === friendId
    );
    const userRequest = friend?.friendsList?.find(
      (friend) => friend?.userId?.toString() === userId
    );

    if (!friendRequest || !userRequest) {
      throw new CustomError(404, "Friend request not found");
    }

    // Check if the friend request is received
    if (friendRequest.status !== "received") {
      throw new CustomError(400, "Friend request is not received");
    }

    // Accept the friend request
    friendRequest.status = "accepted";
    userRequest.status = "accepted";

    // Emit the friend request accepted notification
    const dataForNotification = {
      senderId: userId,
      senderName: user?.fullName,
      senderImage: user?.profileImage,
      receiverId: friendId,
      entityId: userId,
      entityType: "user",
    };
    await handleAcceptedFriendRequestNotification(dataForNotification);

    // Save changes
    await user.save({ session });
    await friend.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return success message
    return { message: "Friend request accepted successfully" };
  } catch (error) {
    // Abort the transaction in case of error
    await session.abortTransaction();
    session.endSession();
    throw new CustomError(
      error?.statusCode || 500,
      error?.message || "Internal Server Error"
    );
  }
};

// Static method for canceling or removing friend
userSchema.statics.cancelOrRemoveFriend = async function ({
  userId,
  friendId,
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Convert IDs to strings
    userId = userId.toString();
    friendId = friendId.toString();

    // Find the user and friend
    const user = await this.findOne({ _id: userId }).session(session).exec();
    const friend = await this.findOne({ _id: friendId })
      .session(session)
      .exec();

    // Check if the user and friend exist
    if (!user) {
      throw new CustomError(404, "User not found");
    }
    if (!friend) {
      throw new CustomError(404, "Friend not found");
    }

    // Check if the user is trying to cancel a friend request to themselves
    if (userId === friendId) {
      throw new CustomError(
        400,
        "You cannot cancel a friend request to yourself"
      );
    }

    // Check if the friend request exists
    const friendRequest = user.friendsList.find(
      (friend) => friend?.userId?.toString() === friendId
    );
    const userRequest = friend.friendsList.find(
      (friend) => friend?.userId?.toString() === userId
    );

    if (!friendRequest || !userRequest) {
      throw new CustomError(404, "Friend request not found");
    }

    // Remove the friend request
    user.friendsList = user.friendsList.filter(
      (friend) => friend.userId.toString() !== friendId
    );
    friend.friendsList = friend.friendsList.filter(
      (friend) => friend.userId.toString() !== userId
    );

    // Save the changes
    await user.save({ session });
    await friend.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send success message based on the status
    if (friendRequest?.status === "sent") {
      return { message: "Friend request canceled successfully" };
    } else if (friendRequest?.status === "received") {
      return { message: "Friend request rejected successfully" };
    } else {
      return { message: "Friend removed successfully" };
    }
  } catch (error) {
    // Abort the transaction in case of error
    await session.abortTransaction();
    session.endSession();
    throw new CustomError(
      error?.statusCode || 500,
      error?.message || "Internal Server Error"
    );
  }
};

//add or update current location
userSchema.statics.modifyCurrentLocation = async function ({
  userId,
  position,
}) {
  try {
    //convert userId to string
    userId = userId.toString();

    // Find the user
    const user = await this.findOne({ _id: userId }).exec();

    // Check if the user exists
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    //get the latitude and longitude from the position
    const { latitude, longitude } = position;

    // Update the current location
    user.currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    // Save the changes
    await user.save();

    // Return success message
    return { message: "Current location updated successfully" };
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
